import { NextResponse } from "next/server";
import { auth } from "../auth";
// import squareWasm from "./square.wasm?module";

export default auth((req) => {
  console.log("middleware runs");
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
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up", "/verify/:path*"],
  runtime: "experimental-edge",
  unstable_allowDynamic: [
    "/lib/connectDB.ts", // allows a single file
    "/models/user.model.ts", // allows a single file
    "/node_modules/function-bind/**" // use a glob to allow anything in the function-bind 3rd party module
  ]
};
