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

const LINKED_ACCOUNT_COLUMNS =
  "id, link_key, steam_id, steam_persona, steam_avatar, discord_id, discord_username, discord_global_name, discord_avatar";

function assertIdentityColumn(identityColumn) {
  if (identityColumn !== "steam_id" && identityColumn !== "discord_id") {
    throw new Error("Unsupported linked-account identity column");
  }
}

function mergedAccountValues(existing, current, values, linkKey) {
  return {
    link_key: linkKey,
    steam_id: values.steam_id ?? existing?.steam_id ?? current?.steam_id ?? null,
    steam_persona:
      values.steam_persona ?? existing?.steam_persona ?? current?.steam_persona ?? null,
    steam_avatar:
      values.steam_avatar ?? existing?.steam_avatar ?? current?.steam_avatar ?? null,
    discord_id: values.discord_id ?? existing?.discord_id ?? current?.discord_id ?? null,
    discord_username:
      values.discord_username ??
      existing?.discord_username ??
      current?.discord_username ??
      null,
    discord_global_name:
      values.discord_global_name ??
      existing?.discord_global_name ??
      current?.discord_global_name ??
      null,
    discord_avatar:
      values.discord_avatar ??
      existing?.discord_avatar ??
      current?.discord_avatar ??
      null,
    updated_at: new Date().toISOString()
  };
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

  const [{ data: current, error: currentError }, { data: existing, error: existingError }] =
    await Promise.all([
      client
        .from("linked_accounts")
        .select(LINKED_ACCOUNT_COLUMNS)
        .eq("link_key", linkKey)
        .maybeSingle(),
      client
        .from("linked_accounts")
        .select(LINKED_ACCOUNT_COLUMNS)
        .eq(identityColumn, identityValue)
        .maybeSingle()
    ]);

  if (currentError) throw currentError;
  if (existingError) throw existingError;

  if (existing && current && existing.id !== current.id) {
    if (
      existing.steam_id &&
      current.steam_id &&
      existing.steam_id !== current.steam_id
    ) {
      throw new Error("This browser session is linked to a different Steam account");
    }

    if (
      existing.discord_id &&
      current.discord_id &&
      existing.discord_id !== current.discord_id
    ) {
      throw new Error("This browser session is linked to a different Discord account");
    }

    const merged = mergedAccountValues(existing, current, values, linkKey);
    const { error: deleteError } = await client
      .from("linked_accounts")
      .delete()
      .eq("id", current.id);

    if (deleteError) throw deleteError;

    const { error: mergeError } = await client
      .from("linked_accounts")
      .update(merged)
      .eq("id", existing.id);

    if (mergeError) {
      console.error("[linking] identity merge failed after removing partial row", {
        identityColumn,
        identityValue,
        mergeError
      });
      throw mergeError;
    }

    return;
  }

  if (existing) {
    const { error } = await client
      .from("linked_accounts")
      .update(mergedAccountValues(existing, current, values, linkKey))
      .eq("id", existing.id);

    if (error) throw error;
    return;
  }

  const { error } = await client.from("linked_accounts").upsert(
    mergedAccountValues(null, current, values, linkKey),
    { onConflict: "link_key" }
  );

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
