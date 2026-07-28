import { NextResponse } from "next/server";
import {
  LINK_COOKIE,
  getSupabase,
  getLinkedAccount,
  getOrCreateLinkKey,
  linkCookieOptions,
  publicAccount
} from "../_utils/linking";

export const dynamic = "force-dynamic";

const STATUS_ACCOUNT_COLUMNS =
  "link_key, steam_id, steam_persona, steam_avatar, discord_id, discord_username, discord_global_name, discord_avatar, updated_at";

function accountScore(account) {
  return Number(Boolean(account?.steam_id)) + Number(Boolean(account?.discord_id));
}

async function resolveLinkedAccount(request) {
  const cookieKeys = [
    ...new Set(
      request.cookies
        .getAll(LINK_COOKIE)
        .map((cookie) => cookie.value)
        .filter(Boolean)
    )
  ];

  if (!cookieKeys.length) {
    const linkKey = getOrCreateLinkKey(request);
    return { linkKey, account: await getLinkedAccount(linkKey), cookieCount: 0 };
  }

  const { data, error } = await getSupabase()
    .from("linked_accounts")
    .select(STATUS_ACCOUNT_COLUMNS)
    .in("link_key", cookieKeys);

  if (error) throw error;

  const accounts = [...(data || [])].sort((left, right) => {
    const scoreDifference = accountScore(right) - accountScore(left);
    if (scoreDifference) return scoreDifference;
    return (
      new Date(right.updated_at || 0).getTime() -
      new Date(left.updated_at || 0).getTime()
    );
  });

  return {
    linkKey: accounts[0]?.link_key || cookieKeys[0],
    account: accounts[0] || null,
    cookieCount: cookieKeys.length
  };
}

export async function GET(request) {
  try {
    const { linkKey, account, cookieCount } = await resolveLinkedAccount(request);
    console.log("[linking] status resolved", {
      recordFound: Boolean(account),
      steamLinked: Boolean(account?.steam_id),
      discordLinked: Boolean(account?.discord_id),
      duplicateCookiesReconciled: Math.max(0, cookieCount - 1)
    });
    const response = NextResponse.json(
      { ok: true, ...publicAccount(account) },
      { headers: { "Cache-Control": "no-store" } }
    );

    // OAuth callbacks run on the apex domain while the public site uses www.
    // Replacing the host-only cookie prevents an older www cookie from
    // shadowing the newer shared-domain OAuth cookie.
    const cookieOptions = linkCookieOptions();
    delete cookieOptions.domain;
    response.cookies.set(LINK_COOKIE, linkKey, cookieOptions);
    return response;
  } catch (error) {
    console.error("[linking] status lookup failed", error);
    return NextResponse.json(
      { ok: false, error: "Unable to load linked accounts" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
