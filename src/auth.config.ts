// auth.config.ts — Edge-safe portion of the NextAuth config.
//
// Used by proxy.ts (which runs on the edge runtime) and re-used as the base
// for auth.ts. Contains everything that does NOT require database access:
// session strategy, cookies, pages, callbacks operating on the JWT.
//
// The providers list (which uses Prisma + bcrypt) lives in auth.ts. This
// split is the standard NextAuth v5 pattern for edge middleware/proxy.

import type { NextAuthConfig } from "next-auth";

export default {
  providers: [], // auth.ts adds the real Credentials provider
  pages: {
    signIn: "/admin-login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60,   // Refresh the JWT every 24h
  },
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as {
          role?: string;
          subscriptionPlan?: string | null;
          subscriptionStatus?: string | null;
        };
        token.role = u.role;
        token.subscriptionPlan = u.subscriptionPlan ?? null;
        token.subscriptionStatus = u.subscriptionStatus ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as string;
      session.user.subscriptionPlan =
        (token.subscriptionPlan as string | null) ?? null;
      session.user.subscriptionStatus =
        (token.subscriptionStatus as string | null) ?? null;
      return session;
    },
  },
} satisfies NextAuthConfig;
