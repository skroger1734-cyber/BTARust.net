import { NextResponse } from "next/server";

const SITE_URL = "https://btarust.net";
const STEAM_CALLBACK_URL = "https://btarust.net/api/auth/steam/callback";

export async function GET() {
  const params = new URLSearchParams({
    "openid.ns": "http://specs.openid.net/auth/2.0",
    "openid.mode": "checkid_setup",
    "openid.return_to": STEAM_CALLBACK_URL,
    "openid.realm": SITE_URL,
    "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
    "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select"
  });
  return NextResponse.redirect(`https://steamcommunity.com/openid/login?${params.toString()}`);
}
