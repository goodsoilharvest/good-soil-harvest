import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      role?: string;
      subscriptionPlan?: string | null;
      subscriptionStatus?: string | null;
    } & DefaultSession["user"];
  }
}
