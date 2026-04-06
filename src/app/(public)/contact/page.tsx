"use client";

import { useState } from "react";
import type { Metadata } from "next";

// Note: metadata export doesn't work in client components.
// Move to a server wrapper if SEO matters for this page.

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    // Placeholder — wire to an email API (Resend, Formspree, etc.) when ready
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  return (
    <div className="max-w-[var(--max-w-prose)] mx-auto px-4 sm:px-6 py-14">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-[var(--foreground)]">Contact</h1>
        <p className="mt-2 text-[var(--text-muted)]">
          Questions, feedback, or just want to say hello — we'd love to hear from you.
        </p>
      </div>

      {status === "sent" ? (
        <div className="bg-[var(--surface)] rounded-2xl p-8 border border-[var(--border)] text-center">
          <span className="text-4xl block mb-3">✓</span>
          <h2 className="font-serif text-2xl font-bold text-[var(--foreground)] mb-2">Message sent</h2>
          <p className="text-[var(--text-muted)]">We'll get back to you as soon as we can.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={6}
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm transition-colors resize-y"
            />
          </div>
          <button
            type="submit"
            disabled={status === "loading"}
            className="px-8 py-2.5 rounded-full bg-[var(--color-soil-800)] text-white font-semibold text-sm hover:bg-[var(--color-soil-700)] transition-colors disabled:opacity-50"
          >
            {status === "loading" ? "Sending…" : "Send Message"}
          </button>
        </form>
      )}
    </div>
  );
}
