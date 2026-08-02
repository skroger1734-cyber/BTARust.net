import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "node:crypto";

export const LINK_COOKIE = "btarust_link_key";
export const DISCORD_STATE_COOKIE = "btarust_discord_oauth_state";
// OAuth providers have these exact apex-domain callbacks registered. Vercel may
// redirect visitors to www afterwards, so the link cookie is shared by both hosts.
export const SITE_URL = (process.env.OAUTH_SITE_URL || "https://btarust.net").replace(/\/+$/, "");

const MINI_GAMES_LINK_TTL_SECONDS = 10 * 60;

let supabase = null;

export function getSupabase() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.BTA_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BTA_SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  if (!supabase) {
    supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return supabase;
}

export function getOrCreateLinkKey(request) {
  return request.cookies.get(LINK_COOKIE)?.value || crypto.randomUUID();
}

export function linkCookieOptions() {
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365
  };

  if (process.env.NODE_ENV === "production") {
    options.domain = ".btarust.net";
  }

  return options;
}

function miniGamesLinkSecret() {
  const secret =
    process.env.BTA_MINIGAMES_LINK_SECRET ||
    process.env.BTA_GIVEAWAYS_CLIENT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.BTA_SUPABASE_SERVICE_ROLE_KEY;

  if (!secret) throw new Error("Missing mini-games link signing secret");
  return secret;
}

function signMiniGamesPayload(encodedPayload) {
  return createHmac("sha256", miniGamesLinkSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createMiniGamesLinkTicket(discordId) {
  if (!/^\d{17,20}$/.test(String(discordId || ""))) {
    throw new Error("Invalid Discord account identifier");
  }

  const encodedPayload = Buffer.from(
    JSON.stringify({
      v: 1,
      discordId: String(discordId),
      expiresAt: Math.floor(Date.now() / 1000) + MINI_GAMES_LINK_TTL_SECONDS
    })
  ).toString("base64url");

  return `${encodedPayload}.${signMiniGamesPayload(encodedPayload)}`;
}

export function verifyMiniGamesLinkTicket(ticket) {
  const [encodedPayload, signature, extra] = String(ticket || "").split(".");
  if (!encodedPayload || !signature || extra) throw new Error("Invalid mini-games link ticket");

  const expected = Buffer.from(signMiniGamesPayload(encodedPayload));
  const supplied = Buffer.from(signature);
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) {
    throw new Error("Invalid mini-games link ticket");
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
  } catch {
    throw new Error("Invalid mini-games link ticket");
  }

  if (
    payload?.v !== 1 ||
    !/^\d{17,20}$/.test(String(payload.discordId || "")) ||
    !Number.isInteger(payload.expiresAt) ||
    payload.expiresAt < Math.floor(Date.now() / 1000)
  ) {
    throw new Error("Expired or invalid mini-games link ticket");
  }

  return { discordId: String(payload.discordId) };
}

function assertIdentityColumn(identityColumn) {
  if (identityColumn !== "steam_id" && identityColumn !== "discord_id") {
    throw new Error("Unsupported linked-account identity column");
  }
}

export async function saveLinkedIdentity({
  linkKey,
  identityColumn,
  identityValue,
  values
}) {
  if (!linkKey || !identityValue) {
    throw new Error("Missing link key or verified account identity");
  }

  assertIdentityColumn(identityColumn);
  const client = getSupabase();

  const { error } = await client.rpc("bta_save_linked_identity", {
    p_link_key: linkKey,
    p_identity_column: identityColumn,
    p_identity_value: identityValue,
    p_values: values || {}
  });

  if (error) throw error;
}

export async function getLinkedAccount(linkKey) {
  if (!linkKey) return null;

  const { data, error } = await getSupabase()
    .from("linked_accounts")
    .select(
      "steam_id, steam_persona, steam_avatar, discord_id, discord_username, discord_global_name, discord_avatar"
    )
    .eq("link_key", linkKey)
    .maybeSingle();

  if (error) throw error;
  return data || null;
}

export function publicAccount(account) {
  return {
    steam: account?.steam_id
      ? {
          linked: true,
          id: account.steam_id,
          name: account.steam_persona || "Steam Player",
          avatar: account.steam_avatar || null
        }
      : { linked: false },
    discord: account?.discord_id
      ? {
          linked: true,
          id: account.discord_id,
          name: account.discord_global_name || account.discord_username || "Discord User",
          username: account.discord_username || null,
          avatar: account.discord_avatar || null
        }
      : { linked: false }
  };
}
