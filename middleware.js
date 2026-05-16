import { NextResponse } from "next/server";
const CANONICAL_HOST = "btarust.net";
const VERCEL_HOST = "btarustnet.vercel.app";
export function middleware(request) {
  const host = request.headers.get("host") || "";
  const url = request.nextUrl.clone();
  if (host.endsWith(".vercel.app") && host !== VERCEL_HOST && !host.startsWith("localhost")) {
    url.protocol = "https:"; url.host = CANONICAL_HOST; return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
