"use client";

import { useState } from "react";

export default function ContactPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [message, setMessage]   = useState("");
  const [status, setStatus]     = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message }),
    });

    if (res.ok) {
      setStatus("sent");
    } else {
      const data = await res.json().catch(() => ({}));
      setErrorMsg(data.error ?? "Failed to send. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
        <div className="bg-[var(--surface)] rounded-2xl p-10 border border-[var(--border)] text-center">
          <span className="text-5xl block mb-4">✓</span>
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-2">Message sent</h2>
          <p className="text-[var(--text-muted)]">
            Thanks for reaching out — we&apos;ll get back to you soon.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">Contact</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Questions, feedback, or just want to say hello — we&apos;d love to hear from you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors resize-y"
          />
        </div>

        {status === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
        )}

        <button
          type="submit"
          disabled={status === "loading"}
          className="px-8 py-2.5 rounded-full bg-[var(--color-soil-800)] text-white font-semibold text-sm hover:bg-[var(--color-soil-700)] transition-colors disabled:opacity-50"
        >
          {status === "loading" ? "Sending…" : "Send message"}
        </button>
      </form>
    </div>
  );
}
