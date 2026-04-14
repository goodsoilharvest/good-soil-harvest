"use client";

import { useState, useEffect, useCallback } from "react";
import { niches } from "@/lib/config";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; ++i) out[i] = raw.charCodeAt(i);
  return out;
}

interface SubState {
  enabled: boolean;
  niches: Set<string>;
  emailDigest: boolean;
  endpoint: string | null;
}

export function NotificationPrefs() {
  const [supported, setSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [state, setState] = useState<SubState>({
    enabled: false,
    niches: new Set(),
    emailDigest: false,
    endpoint: null,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load existing subscription state
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);
    setPermission(Notification.permission);

    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;

      // Fetch saved preferences from backend
      const res = await fetch("/api/notifications/subscribe");
      const data = await res.json();
      const match = data.subscriptions?.find((s: { endpoint: string }) => s.endpoint === sub.endpoint);
      if (match) {
        setState({
          enabled: true,
          niches: new Set(match.niches ? match.niches.split(",").filter(Boolean) : []),
          emailDigest: match.emailDigest ?? false,
          endpoint: sub.endpoint,
        });
      } else {
        setState((prev) => ({ ...prev, enabled: true, endpoint: sub.endpoint }));
      }
    });
  }, []);

  const toggleNiche = useCallback((slug: string) => {
    setState((prev) => {
      const next = new Set(prev.niches);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return { ...prev, niches: next };
    });
    setSaved(false);
  }, []);

  const toggleAll = useCallback(() => {
    setState((prev) => {
      const allSlugs = niches.map((n) => n.slug);
      const allSelected = allSlugs.every((s) => prev.niches.has(s));
      return { ...prev, niches: allSelected ? new Set() : new Set(allSlugs) };
    });
    setSaved(false);
  }, []);

  async function enableNotifications() {
    setSaving(true);
    try {
      // Register service worker
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

      // Request notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== "granted") {
        setSaving(false);
        return;
      }

      // Subscribe to push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });

      const keys = sub.toJSON().keys!;

      // Save to backend with default: all niches
      const allNiches = niches.map((n) => n.slug);
      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          niches: allNiches,
          emailDigest: false,
        }),
      });

      setState({
        enabled: true,
        niches: new Set(allNiches),
        emailDigest: false,
        endpoint: sub.endpoint,
      });
      setSaved(true);
    } catch (err) {
      console.error("[notifications] enable failed:", err);
    }
    setSaving(false);
  }

  async function savePreferences() {
    if (!state.endpoint) return;
    setSaving(true);
    try {
      // Get current push sub for keys
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      const keys = sub.toJSON().keys!;

      await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: sub.endpoint,
          p256dh: keys.p256dh,
          auth: keys.auth,
          niches: [...state.niches],
          emailDigest: state.emailDigest,
        }),
      });
      setSaved(true);
    } catch (err) {
      console.error("[notifications] save failed:", err);
    }
    setSaving(false);
  }

  async function disableNotifications() {
    setSaving(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/notifications/subscribe", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState({ enabled: false, niches: new Set(), emailDigest: false, endpoint: null });
    } catch (err) {
      console.error("[notifications] disable failed:", err);
    }
    setSaving(false);
  }

  if (!supported) return null;

  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">🔔</span>
        <div className="flex-1">
          <h3 className="font-serif font-bold text-lg text-[var(--foreground)] mb-1">Notifications</h3>

          {!state.enabled ? (
            <>
              <p className="text-sm text-[var(--text-muted)] mb-4 leading-relaxed">
                Get notified when new articles are published in the topics you care about.
                You&apos;ll receive one daily summary — never spam.
              </p>
              {permission === "denied" ? (
                <p className="text-sm text-red-600">
                  Notifications are blocked in your browser settings. To enable them,
                  open your browser&apos;s site settings for goodsoilharvest.com and allow notifications.
                </p>
              ) : (
                <button
                  onClick={enableNotifications}
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[var(--color-harvest-500)] hover:bg-[var(--color-harvest-400)] text-[var(--color-soil-900)] text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "Enabling..." : "Enable Notifications"}
                </button>
              )}
            </>
          ) : (
            <>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                Choose which topics to be notified about. One notification per day, summarizing all new articles in your selected topics.
              </p>

              {/* Topic toggles */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={toggleAll}
                  className="text-xs font-semibold text-[var(--color-sage-600)] hover:text-[var(--color-sage-500)] transition-colors"
                >
                  {niches.every((n) => state.niches.has(n.slug)) ? "Deselect all" : "Select all"}
                </button>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {niches.map((niche) => {
                    const active = state.niches.has(niche.slug);
                    return (
                      <button
                        key={niche.slug}
                        onClick={() => toggleNiche(niche.slug)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          active
                            ? "border-[var(--color-sage-400)] bg-[var(--color-sage-600)]/10 text-[var(--foreground)]"
                            : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--color-sage-300)]"
                        }`}
                      >
                        <span>{niche.icon}</span>
                        {niche.shortTitle}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Email digest toggle */}
              <label className="flex items-center gap-3 mb-5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.emailDigest}
                  onChange={(e) => {
                    setState((prev) => ({ ...prev, emailDigest: e.target.checked }));
                    setSaved(false);
                  }}
                  className="w-4 h-4 rounded border-[var(--border)] accent-[var(--color-sage-600)]"
                />
                <span className="text-sm text-[var(--text-muted)]">Also send me a daily email digest</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  onClick={savePreferences}
                  disabled={saving}
                  className="px-5 py-2 rounded-xl bg-[var(--color-sage-600)] hover:bg-[var(--color-sage-500)] text-white text-sm font-semibold transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : saved ? "Saved" : "Save Preferences"}
                </button>
                <button
                  onClick={disableNotifications}
                  disabled={saving}
                  className="text-sm text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  Turn off notifications
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
