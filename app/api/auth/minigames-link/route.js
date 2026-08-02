import { NextResponse } from "next/server";
import {
  LINK_COOKIE,
  SITE_URL,
  getOrCreateLinkKey,
  linkCookieOptions,
  saveLinkedIdentity,
  verifyMiniGamesLinkTicket
} from "../_utils/linking";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const redirect = new URL("/account-linking", SITE_URL);
  redirect.searchParams.set("from", "minigames");

  try {
    const { discordId } = verifyMiniGamesLinkTicket(
      new URL(request.url).searchParams.get("ticket")
    );
    const linkKey = getOrCreateLinkKey(request);

    await saveLinkedIdentity({
      linkKey,
      identityColumn: "discord_id",
      identityValue: discordId,
      values: { discord_id: discordId }
    });

    redirect.searchParams.set("discord", "linked");
    const response = NextResponse.redirect(redirect);
    response.cookies.set(LINK_COOKIE, linkKey, linkCookieOptions());
    return response;
  } catch (error) {
    console.error("[minigames-link] signed account handoff failed", error);
    redirect.searchParams.set("discord", "failed");
    return NextResponse.redirect(redirect);
  }
}
