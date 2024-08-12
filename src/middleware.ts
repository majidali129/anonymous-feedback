import { NextResponse } from "next/server";
import { auth } from "../auth";

export default auth((req) => {
  const url = req.nextUrl.pathname;
  const AuthenticatedUser = req.auth?.user;
  const publicPaths = ["/sign-in", "/sign-up", "/verify"];
  if (AuthenticatedUser && publicPaths.includes(url)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!AuthenticatedUser && !publicPaths.includes(url)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/verify/:path*"]
};
