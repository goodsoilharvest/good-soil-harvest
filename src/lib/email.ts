import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM = process.env.RESEND_FROM_EMAIL ?? "Good Soil Harvest <noreply@goodsoilharvest.com>";
const SITE = process.env.NEXTAUTH_URL ?? "https://goodsoilharvest.com";

// ─── Verification email ───────────────────────────────────────────────────────

export async function sendVerificationEmail(email: string, code: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `${code} is your Good Soil Harvest verification code`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:26px;font-weight:bold;margin:12px 0 4px;">Good Soil Harvest</h1>
          <p style="color:#6b4423;font-size:14px;margin:0;">Email verification</p>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-bottom:24px;">
          Enter this code to verify your email and activate your account:
        </p>

        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-block;background:#f2ede2;border:2px solid #c4d9b4;border-radius:12px;padding:20px 40px;">
            <span style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#2e1a0a;font-family:monospace;">
              ${code}
            </span>
          </div>
          <p style="font-size:13px;color:#6b4423;margin-top:12px;">Expires in 30 minutes</p>
        </div>

        <p style="font-size:12px;color:#9a7a5a;text-align:center;">
          If you didn't create an account, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}

// ─── Contact form email ───────────────────────────────────────────────────────

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  const to = process.env.CONTACT_TO_EMAIL ?? "goodsoilharvest@proton.me";

  return resend.emails.send({
    from: FROM,
    to,
    replyTo: email,
    subject: `Contact form: message from ${name}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <h2 style="font-size:20px;margin-bottom:4px;">New message from your contact form</h2>
        <p style="font-size:13px;color:#6b4423;margin-bottom:28px;border-bottom:1px solid #e2edd8;padding-bottom:16px;">Sent via goodsoilharvest.com</p>

        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;color:#6b4423;width:80px;vertical-align:top;">Name</td>
            <td style="padding:8px 0;font-weight:600;">${name}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b4423;vertical-align:top;">Email</td>
            <td style="padding:8px 0;">
              <a href="mailto:${email}" style="color:#637f52;">${email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;color:#6b4423;vertical-align:top;">Message</td>
            <td style="padding:8px 0;line-height:1.6;white-space:pre-wrap;">${message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
          </tr>
        </table>

        <p style="font-size:12px;color:#9a7a5a;margin-top:32px;">Hit Reply to respond directly to ${name}.</p>
      </div>
    `,
  });
}

// ─── Feedback alert (CRITICAL/HIGH) ──────────────────────────────────────────

export async function sendFeedbackAlert(items: Array<{ summary: string; priority: string; email: string | null; message: string; pageUrl: string | null }>) {
  const to = process.env.CONTACT_TO_EMAIL ?? "goodsoilharvest@proton.me";
  const rows = items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #e2edd8;font-weight:600;color:${i.priority === 'CRITICAL' ? '#c00' : '#b45309'}">${i.priority}</td>
      <td style="padding:8px;border-bottom:1px solid #e2edd8;">${i.summary.replace(/</g, "&lt;")}</td>
      <td style="padding:8px;border-bottom:1px solid #e2edd8;font-size:12px;color:#6b4423;">${(i.email ?? "anonymous").replace(/</g, "&lt;")}</td>
    </tr>`
  ).join("");

  return resend.emails.send({
    from: FROM,
    to,
    subject: `⚠️ ${items.length} ${items[0].priority} feedback item(s) need attention`,
    html: `
      <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <h2 style="font-size:20px;margin-bottom:4px;">Feedback Alert</h2>
        <p style="font-size:13px;color:#6b4423;margin-bottom:20px;">AI triage flagged ${items.length} item(s) as ${items[0].priority} priority.</p>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <thead><tr>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #c4d9b4;width:80px;">Priority</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #c4d9b4;">Summary</th>
            <th style="text-align:left;padding:8px;border-bottom:2px solid #c4d9b4;width:140px;">From</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;text-align:center;">
          <a href="${SITE}/admin/feedback" style="display:inline-block;background:#637f52;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
            View in CMS
          </a>
        </div>
      </div>
    `,
  });
}

// ─── Weekly digest email ─────────────────────────────────────────────────────

export async function sendWeeklyDigest(
  email: string,
  posts: Array<{ title: string; slug: string; niche: string; description: string | null }>
) {
  const nicheIcons: Record<string, string> = {
    faith: "✝️", finance: "💰", psychology: "🧠", philosophy: "💡", science: "🔬",
  };

  const rows = posts.map(p =>
    `<tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e2edd8;font-size:13px;color:#6b4423;width:30px;vertical-align:top;">${nicheIcons[p.niche] ?? "📖"}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e2edd8;">
        <a href="${SITE}/blog/${p.slug}" style="font-size:15px;font-weight:600;color:#2e1a0a;text-decoration:none;">${p.title.replace(/</g, "&lt;")}</a>
        ${p.description ? `<div style="font-size:13px;color:#6b4423;margin-top:4px;line-height:1.5;">${p.description.slice(0, 120).replace(/</g, "&lt;")}…</div>` : ""}
      </td>
    </tr>`
  ).join("");

  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Your weekly harvest — ${posts.length} new article${posts.length !== 1 ? "s" : ""}`,
    html: `
      <div style="font-family:Georgia,serif;max-width:580px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:24px;font-weight:bold;margin:12px 0 4px;">Your Weekly Harvest</h1>
          <p style="color:#6b4423;font-size:14px;margin:0;">New articles from the topics you follow</p>
        </div>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <div style="text-align:center;margin-top:28px;">
          <a href="${SITE}/dashboard" style="display:inline-block;background:#637f52;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">
            Open your feed
          </a>
        </div>
        <p style="font-size:11px;color:#9a7a5a;text-align:center;margin-top:28px;">
          You're receiving this because you opted into the weekly digest.
          <a href="${SITE}/account" style="color:#637f52;">Manage preferences</a>
        </p>
      </div>
    `,
  });
}

// ─── Password reset email ────────────────────────────────────────────────────

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${SITE}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`;
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Reset your Good Soil Harvest password",
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:26px;font-weight:bold;margin:12px 0 4px;">Reset your password</h1>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-bottom:24px;">
          Someone (hopefully you) requested a password reset for your Good Soil Harvest account.
          Click the button below to set a new password. This link expires in 30 minutes.
        </p>

        <div style="text-align:center;margin-bottom:32px;">
          <a href="${resetUrl}" style="display:inline-block;background:#637f52;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Reset password
          </a>
        </div>

        <p style="font-size:13px;color:#6b4423;line-height:1.6;margin-bottom:16px;text-align:center;">
          Or copy this link: <br/><span style="font-family:monospace;color:#9a7a5a;">${resetUrl}</span>
        </p>

        <p style="font-size:12px;color:#9a7a5a;text-align:center;margin-top:24px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    `,
  });
}

// ─── Welcome email (post-verification) ───────────────────────────────────────

export async function sendWelcomeEmail(email: string) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: "Welcome to Good Soil Harvest",
    html: `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:40px 24px;color:#2e1a0a;">
        <div style="text-align:center;margin-bottom:32px;">
          <span style="font-size:48px;">🌱</span>
          <h1 style="font-size:26px;font-weight:bold;margin:12px 0 4px;">Welcome to Good Soil</h1>
          <p style="color:#6b4423;font-size:14px;margin:0;">Your account is verified and ready</p>
        </div>

        <p style="font-size:15px;line-height:1.6;margin-bottom:24px;">
          Thanks for joining Good Soil Harvest — a place to grow in faith, wisdom, and practical knowledge.
          Free articles are always available, and you can upgrade to a membership anytime to unlock everything.
        </p>

        <div style="text-align:center;margin-bottom:32px;">
          <a href="${SITE}/blog" style="display:inline-block;background:#637f52;color:#fff;font-size:15px;font-weight:600;padding:14px 32px;border-radius:10px;text-decoration:none;">
            Start reading
          </a>
        </div>

        <p style="font-size:12px;color:#9a7a5a;text-align:center;">
          <a href="${SITE}/pricing" style="color:#637f52;">See membership plans</a> &nbsp;·&nbsp;
          <a href="${SITE}/contact" style="color:#637f52;">Contact us</a>
        </p>
      </div>
    `,
  });
}
