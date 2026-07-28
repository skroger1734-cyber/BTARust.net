import { createClient } from "@supabase/supabase-js";

export const LINK_COOKIE = "btarust_link_key";
export const DISCORD_STATE_COOKIE = "btarust_discord_oauth_state";
// OAuth providers have these exact apex-domain callbacks registered. Vercel may
// redirect visitors to www afterwards, so the link cookie is shared by both hosts.
export const SITE_URL = (process.env.OAUTH_SITE_URL || "https://btarust.net").replace(/\/+$/, "");

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
