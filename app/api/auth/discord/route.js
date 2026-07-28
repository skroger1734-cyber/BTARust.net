import { NextResponse } from "next/server";
import {
  DISCORD_STATE_COOKIE,
  LINK_COOKIE,
  SITE_URL,
  getOrCreateLinkKey,
  linkCookieOptions
} from "../_utils/linking";

const DISCORD_CALLBACK_URL = `${SITE_URL}/api/auth/discord/callback`;

export async function GET(request) {
  const clientId =
    process.env.DISCORD_CLIENT_ID ||
    process.env.BTA_DISCORD_CLIENT_ID ||
    "";

  if (!clientId) {
    return NextResponse.redirect(`${SITE_URL}/account-linking?discord=missing_client_id`);
  }

  const state = crypto.randomUUID();
  const linkKey = getOrCreateLinkKey(request);
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: DISCORD_CALLBACK_URL,
    response_type: "code",
    scope: "identify",
    state
  });

  const response = NextResponse.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
  response.cookies.set(LINK_COOKIE, linkKey, linkCookieOptions());
  response.cookies.set(DISCORD_STATE_COOKIE, state, {
    ...linkCookieOptions(),
    maxAge: 60 * 10
  });
  return response;
}
