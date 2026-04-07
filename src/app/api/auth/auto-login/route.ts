import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const plan  = searchParams.get("plan");

  const siteUrl = process.env.NEXTAUTH_URL ?? "https://goodsoilharvest.com";

  if (!token || !email) {
    return NextResponse.redirect(new URL("/sign-in", siteUrl));
  }

  // Quick pre-check — if token is already gone or expired, bail early
  const user = await prisma.user.findUnique({ where: { email } });
  if (
    !user ||
    !user.verifyToken ||
    user.verifyToken !== token ||
    !user.verifyTokenExp ||
    user.verifyTokenExp < new Date()
  ) {
    return NextResponse.redirect(new URL("/sign-in?error=expired", siteUrl));
  }

  // Determine where to land after sign-in.
  // If plan is present, hit the account page with ?checkout=PLAN so it
  // auto-fires Stripe checkout once the session is established.
  const redirectTo = plan ? `/account?checkout=${plan}` : "/account";

  // server-side signIn throws NEXT_REDIRECT — that becomes the response.
  // The credentials authorize() function will validate + consume the token.
  await signIn("credentials", { email, loginToken: token, redirectTo });
}
