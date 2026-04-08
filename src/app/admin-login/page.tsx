"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already authenticated as admin — go straight in
  useEffect(() => {
    if (status === "authenticated" && (session?.user as { role?: string })?.role === "ADMIN") {
      window.location.href = "/admin";
    }
  }, [status, session]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password.");
      setLoading(false);
    } else {
      // Hard redirect so the server re-reads the fresh session
      window.location.href = "/admin";
    }
  }

  if (status === "loading") return null;

  return (
    <div className="min-h-screen bg-[var(--color-parchment)] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <div className="text-center mb-8">
          <span className="text-4xl block mb-2">🌱</span>
          <h1 className="font-serif text-2xl font-bold text-[var(--color-soil-800)]">
            Good Soil Admin
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-soil-700)] mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-sage-200)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-soil-700)] mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-[var(--color-sage-200)] focus:outline-none focus:border-[var(--color-sage-500)] text-sm"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-[var(--color-soil-800)] text-white font-semibold text-sm hover:bg-[var(--color-soil-700)] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
