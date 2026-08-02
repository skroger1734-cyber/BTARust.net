import { NextResponse } from "next/server";
const CANONICAL_HOST = "btarust.net";
const VERCEL_HOST = "btarustnet.vercel.app";
const MINIGAMES_HOST = "minigames.btarust.net";

function secureCommon(response) {
  response.headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), microphone=(), payment=(), usb=()"
  );
  return response;
}

function secureMiniGames(response) {
  secureCommon(response);
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https://cdn.discordapp.com",
      "media-src 'self'",
      "connect-src 'self' https://discord.com https://cdn.discordapp.com",
      "frame-ancestors 'self' https://discord.com https://*.discord.com https://*.discordsays.com",
      "base-uri 'self'",
      "form-action 'self' https://discord.com"
    ].join("; ")
  );
  return response;
}

export function middleware(request) {
  const host = request.headers.get("host") || "";
  const normalizedHost = host.split(":")[0].toLowerCase();
  const url = request.nextUrl.clone();

  if (normalizedHost === MINIGAMES_HOST && url.pathname === "/") {
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    url.pathname = "/minigames";
    return secureCommon(NextResponse.redirect(url, url.searchParams.has("code") ? 307 : 308));
  }

  if (url.pathname === "/minigames" || url.pathname === "/minigames/") {
    url.pathname = "/minigames/index.html";
    return secureMiniGames(NextResponse.rewrite(url));
  }

  if (host.endsWith(".vercel.app") && host !== VERCEL_HOST && !host.startsWith("localhost")) {
    url.protocol = "https:"; url.host = CANONICAL_HOST; return secureCommon(NextResponse.redirect(url, 308));
  }
  return secureCommon(NextResponse.next());
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"] };
