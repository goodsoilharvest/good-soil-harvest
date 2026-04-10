import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
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
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        // token.sub is automatically set to user.id by NextAuth
        const u = user as { role?: string; subscriptionPlan?: string | null; subscriptionStatus?: string | null };
        token.role = u.role;
        token.subscriptionPlan = u.subscriptionPlan ?? null;
        token.subscriptionStatus = u.subscriptionStatus ?? null;
      }
      return token;
    },
    session({ session, token }) {
      // token.sub holds the user id (set automatically by NextAuth)
      if (token.sub) session.user.id = token.sub;
      if (token.role) session.user.role = token.role as string;
      session.user.subscriptionPlan = (token.subscriptionPlan as string | null) ?? null;
      session.user.subscriptionStatus = (token.subscriptionStatus as string | null) ?? null;
      return session;
    },
  },
  pages: {
    signIn: "/admin-login",
  },
  session: { strategy: "jwt" },
});
