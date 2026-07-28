import { NextResponse } from "next/server";
import {
  LINK_COOKIE,
  getLinkedAccount,
  getOrCreateLinkKey,
  linkCookieOptions,
  publicAccount
} from "../_utils/linking";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const linkKey = getOrCreateLinkKey(request);

  try {
    const account = await getLinkedAccount(linkKey);
    const response = NextResponse.json(
      { ok: true, ...publicAccount(account) },
      { headers: { "Cache-Control": "no-store" } }
    );

    response.cookies.set(LINK_COOKIE, linkKey, linkCookieOptions());
    return response;
  } catch (error) {
    console.error("[linking] status lookup failed", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load linked accounts" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
