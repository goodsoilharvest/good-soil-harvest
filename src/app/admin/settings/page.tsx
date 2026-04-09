"use client";

import { useState } from "react";

export default function SettingsPage() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setMessage("New passwords don't match.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const res = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      setMessage("Password updated successfully.");
      setCurrent(""); setNext(""); setConfirm("");
    } else {
      setStatus("error");
      setMessage(data.error ?? "Something went wrong.");
    }
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Settings</h1>
      </div>

      <div className="max-w-md bg-[var(--color-soil-800)] rounded-xl p-6 border border-white/10">
        <h2 className="font-semibold text-white mb-4">Change Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Current Password</label>
            <input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[var(--color-soil-900)] text-white focus:outline-none focus:border-white/30 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">New Password</label>
            <input type="password" value={next} onChange={(e) => setNext(e.target.value)} required minLength={8}
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[var(--color-soil-900)] text-white focus:outline-none focus:border-white/30 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required
              className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[var(--color-soil-900)] text-white focus:outline-none focus:border-white/30 text-sm" />
          </div>

          {message && (
            <p className={`text-sm ${status === "success" ? "text-green-400" : "text-red-400"}`}>
              {message}
            </p>
          )}

          <button type="submit" disabled={status === "loading"}
            className="w-full py-2.5 rounded-lg bg-[var(--color-harvest-500)] text-white font-semibold text-sm hover:bg-[var(--color-harvest-600)] transition-colors disabled:opacity-50">
            {status === "loading" ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </>
  );
}
