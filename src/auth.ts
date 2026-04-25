import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import bcrypt from "bcryptjs";
import authConfig from "./auth.config";

// auth.ts: full NextAuth setup with Prisma + bcrypt. Used by API routes,
// server components, and the auth handlers. The proxy/middleware runs on
// the edge runtime and uses auth.config directly to avoid pulling in this
// module's DB dependencies.
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        loginToken: { label: "Login Token", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;

        const emailLower = (credentials.email as string).trim().toLowerCase();

        // Throttle brute-force attempts at a specific account. 10 tries per 15
        // minutes per email. Login tokens bypass this since they're single-use
        // post-verification and already expire in 5 minutes.
        if (!credentials.loginToken) {
          const limit = await rateLimit({
            action: "signin",
            identifier: emailLower,
            max: 10,
            windowSeconds: 60 * 15,
          });
          if (!limit.ok) {
            // NextAuth authorize() can only return null/user — it can't return
            // a 429. Returning null here forces the client to show "invalid
            // credentials" which is the correct UX for a blocked attacker.
            return null;
          }
        }

        const user = await prisma.user.findUnique({
          where: { email: emailLower },
          include: { subscription: true },
        });

        if (!user) return null;

        // One-time login token path (post-email-verification auto-login)
        if (credentials.loginToken) {
          if (
            !user.verifyToken ||
            user.verifyToken !== (credentials.loginToken as string) ||
            !user.verifyTokenExp ||
            user.verifyTokenExp < new Date()
          ) {
            return null;
          }
          // Consume the token
          await prisma.user.update({
            where: { id: user.id },
            data: { verifyToken: null, verifyTokenExp: null },
          });
        } else {
          // Normal password path
          if (!credentials.password || !user.passwordHash) return null;
          const valid = await bcrypt.compare(
            credentials.password as string,
            user.passwordHash
          );
          if (!valid) return null;
        }

        return {
          id: user.id,
          email: user.email ?? "",
          role: user.role as string,
          subscriptionPlan: (user.subscription?.plan as string | null) ?? null,
          subscriptionStatus: (user.subscription?.status as string | null) ?? null,
        };
      },
    }),
  ],
  // pages, session, cookies, callbacks all live in auth.config.ts via the
  // ...authConfig spread above.
});
