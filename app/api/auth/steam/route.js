import { NextResponse } from "next/server";
import {
  LINK_COOKIE,
  SITE_URL,
  getOrCreateLinkKey,
  linkCookieOptions
} from "../_utils/linking";

const STEAM_CALLBACK_URL = `${SITE_URL}/api/auth/steam/callback`;

export async function GET(request) {
  const linkKey = getOrCreateLinkKey(request);
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": STEAM_CALLBACK_URL,
    "openid.realm": SITE_URL,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });

  const response = NextResponse.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
  response.cookies.set(LINK_COOKIE, linkKey, linkCookieOptions());
  return response;
}
