import { dbAll, dbRun } from "@/lib/db";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Web Push delivery — raw RFC 8291 + RFC 8292 implementation.
// No npm deps (Workers edge runtime). Uses Web Crypto for JWT ES256, ECDH,
// HKDF, AES-128-GCM. Content encoding: aes128gcm (RFC 8188), supported by
// all modern push services (FCM, Mozilla, Apple).
//
// Reference: maximus-thomas/src/worker.js sendWebPush.

interface NotifyNewPostsOpts {
  posts: Array<{ title: string; niche: string; slug: string }>;
}

interface PushSubRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  niches: string;
}

interface PushPayload {
  title: string;
  body: string;
  url: string;
  tag?: string;
}

interface VapidEnv {
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}

/**
 * Fan-out push notifications for newly published posts. Reads subscribers
 * from D1 filtered by their selected niches, encrypts an aes128gcm payload
 * per subscription, and POSTs to the push service. Prunes subscriptions
 * the push service reports as gone (404/410).
 */
export async function notifyNewPosts({ posts }: NotifyNewPostsOpts) {
  if (posts.length === 0) return;

  const env = getCloudflareContext().env as unknown as VapidEnv;
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) {
    console.warn("[push] VAPID keys not configured on Worker");
    return;
  }

  const allSubs = await dbAll<PushSubRow>(
    `SELECT id, endpoint, p256dh, auth, niches FROM push_subscriptions WHERE niches != ''`,
  );

  const tasks: Array<Promise<unknown>> = [];
  for (const sub of allSubs) {
    const userNiches = sub.niches.split(",").filter(Boolean);
    const matchingPosts = posts.filter((p) => userNiches.includes(p.niche));
    if (matchingPosts.length === 0) continue;

    // One push per matching post — small list, simple, gives the user a tap target per article.
    for (const post of matchingPosts) {
      const payload: PushPayload = {
        title: post.title,
        body: `New ${labelForNiche(post.niche)} post`,
        url: `/blog/${post.slug}`,
        tag: post.slug,
      };
      tasks.push(sendWebPush(env, sub, payload));
    }
  }

  await Promise.all(tasks);
}

function labelForNiche(slug: string): string {
  switch (slug) {
    case "faith": return "Faith";
    case "finance": return "Finance";
    case "psychology": return "Psychology";
    case "philosophy": return "Philosophy";
    case "science": return "Science";
    default: return slug;
  }
}

// ──────────────────────────────────────────────────────────────────────────
// Internals — RFC 8291 + RFC 8188 + RFC 8292
// ──────────────────────────────────────────────────────────────────────────

function b64urlEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(str: string): Uint8Array {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function concat(...arrs: Array<ArrayBuffer | Uint8Array>): Uint8Array {
  let total = 0;
  for (const a of arrs) total += a.byteLength;
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrs) {
    out.set(a instanceof Uint8Array ? a : new Uint8Array(a), off);
    off += a.byteLength;
  }
  return out;
}

async function importVapidPrivKey(env: VapidEnv): Promise<CryptoKey> {
  const rawPub = b64urlDecode(env.VAPID_PUBLIC_KEY!);
  if (rawPub.length !== 65 || rawPub[0] !== 0x04) {
    throw new Error("Invalid VAPID_PUBLIC_KEY (expected 65-byte uncompressed P-256 point)");
  }
  const x = b64urlEncode(rawPub.slice(1, 33));
  const y = b64urlEncode(rawPub.slice(33, 65));
  const jwk: JsonWebKey = {
    kty: "EC",
    crv: "P-256",
    x,
    y,
    d: env.VAPID_PRIVATE_KEY!,
    ext: true,
  };
  return crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"],
  );
}

async function vapidAuthHeader(env: VapidEnv, audience: string): Promise<string> {
  const privKey = await importVapidPrivKey(env);
  const enc = new TextEncoder();
  const header = { typ: "JWT", alg: "ES256" };
  const exp = Math.floor(Date.now() / 1000) + 12 * 60 * 60; // 12h
  const claims = {
    aud: audience,
    exp,
    sub: env.VAPID_SUBJECT || "mailto:goodsoilharvest@proton.me",
  };
  const signingInput =
    b64urlEncode(enc.encode(JSON.stringify(header))) +
    "." +
    b64urlEncode(enc.encode(JSON.stringify(claims)));
  const sig = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privKey,
    enc.encode(signingInput),
  );
  const jwt = signingInput + "." + b64urlEncode(sig);
  return `vapid t=${jwt}, k=${env.VAPID_PUBLIC_KEY!}`;
}

async function hkdf(
  salt: Uint8Array,
  ikm: Uint8Array,
  info: Uint8Array,
  length: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey("raw", ikm, { name: "HKDF" }, false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    // @ts-expect-error — Workers' HKDF params accept Uint8Array salt/info but the lib types still want BufferSource
    { name: "HKDF", hash: "SHA-256", salt, info },
    key,
    length * 8,
  );
  return new Uint8Array(bits);
}

async function encryptPushPayload(
  payloadBytes: Uint8Array,
  subP256dhB64: string,
  subAuthB64: string,
): Promise<Uint8Array> {
  const clientPubRaw = b64urlDecode(subP256dhB64);
  const authSecret = b64urlDecode(subAuthB64);

  const asKeyPair = (await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"],
  )) as CryptoKeyPair;
  const asPubRaw = new Uint8Array(await crypto.subtle.exportKey("raw", asKeyPair.publicKey));

  const clientPubKey = await crypto.subtle.importKey(
    "raw",
    clientPubRaw,
    { name: "ECDH", namedCurve: "P-256" },
    false,
    [],
  );
  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: clientPubKey },
    asKeyPair.privateKey,
    256,
  );
  const sharedSecret = new Uint8Array(sharedBits);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const enc = new TextEncoder();

  const keyInfo = concat(enc.encode("WebPush: info\0"), clientPubRaw, asPubRaw);
  const ikm = await hkdf(authSecret, sharedSecret, keyInfo, 32);

  const cek = await hkdf(salt, ikm, enc.encode("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc.encode("Content-Encoding: nonce\0"), 12);

  const plaintext = concat(payloadBytes, new Uint8Array([0x02]));
  const aesKey = await crypto.subtle.importKey("raw", cek, { name: "AES-GCM" }, false, ["encrypt"]);
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aesKey, plaintext),
  );

  // aes128gcm framing: salt(16) || rs(4 BE = 4096) || idlen(1=65) || as_pub(65) || ciphertext
  const rs = new Uint8Array([0, 0, 0x10, 0]);
  const idlen = new Uint8Array([asPubRaw.length]);
  return concat(salt, rs, idlen, asPubRaw, ciphertext);
}

async function sendWebPush(
  env: VapidEnv,
  sub: PushSubRow,
  payload: PushPayload,
): Promise<void> {
  try {
    const url = new URL(sub.endpoint);
    const audience = `${url.protocol}//${url.host}`;
    const auth = await vapidAuthHeader(env, audience);
    const payloadBytes = new TextEncoder().encode(JSON.stringify(payload));
    const body = await encryptPushPayload(payloadBytes, sub.p256dh, sub.auth);

    const res = await fetch(sub.endpoint, {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Encoding": "aes128gcm",
        "Content-Type": "application/octet-stream",
        TTL: "86400",
        Urgency: "normal",
      },
      body,
    });

    if (res.status === 404 || res.status === 410) {
      // Subscription is gone — prune it so we don't keep retrying.
      await dbRun(`DELETE FROM push_subscriptions WHERE endpoint = ?`, sub.endpoint);
      return;
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[push] send failed ${res.status} for ${sub.id}:`, text.slice(0, 200));
    }
  } catch (err) {
    console.warn(`[push] send error for ${sub.id}:`, err);
  }
}
