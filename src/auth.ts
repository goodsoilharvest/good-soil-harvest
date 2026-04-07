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
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          include: { subscription: true },
        });

        if (!user || !user.passwordHash) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!valid) return null;

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
        const u = user as { id?: string; role?: string; subscriptionPlan?: string | null; subscriptionStatus?: string | null };
        token.id = u.id;
        token.role = u.role;
        token.subscriptionPlan = u.subscriptionPlan ?? null;
        token.subscriptionStatus = u.subscriptionStatus ?? null;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
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
