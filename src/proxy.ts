import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isAuthenticated = !!req.auth;
  const isAdmin = req.auth?.user?.role === "ADMIN";

  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
