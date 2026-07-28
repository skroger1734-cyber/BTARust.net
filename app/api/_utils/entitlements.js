import crypto from "node:crypto";
import { getSupabase } from "../auth/_utils/linking";

export const VERIFIED_ROLE_ID =
  process.env.DISCORD_VERIFIED_ROLE_ID ||
  process.env.BTA_DISCORD_LINKED_ROLE_ID ||
  "1504931355991998615";

export const PACKAGE_ENTITLEMENTS = Object.freeze({
  "7439458": {
    name: "VIP Lifetime Kit (KIT ONLY NO PERMS)",
    roleId: "1504931854485029025",
    rustGroup: "vip"
  },
  "7439459": {
    name: "VIP Queue Skip Lifetime",
    roleId: "1504931854485029025",
    rustGroup: "vip"
  },
  "7439462": {
    name: "Recruit Lifetime Kit",
    roleId: "1504932723456741438",
    rustGroup: "recruit"
  },
  "7439464": {
    name: "Enlistment Lifetime Kit",
    roleId: "1504933382503792884",
    rustGroup: "enlistment"
  },
  "7439466": {
    name: "Soldier Lifetime Kit",
    roleId: "1504932715584290897",
    rustGroup: "soldier"
  },
  "7439470": {
    name: "General Lifetime Kit",
    roleId: "1504932536000970833",
    rustGroup: "general"
  },
  "7439471": {
    name: "ULTIMATE Lifetime Bundle",
    roleId: "1525265981994434772",
    rustGroup: "ultimate"
  },
  "7486262": {
    name: "Builder Lifetime Kit",
    roleId: "1504932726095085668",
    rustGroup: "builder"
  },
  "7486415": {
    name: "Electrical Lifetime Kit",
    roleId: "1504933165146574961",
    rustGroup: "electrical"
  },
  "7486439": {
    name: "Farm Lifetime Kit",
    roleId: "1504933209140494396",
    rustGroup: "farm"
  },
  "7486542": {
    name: "Officer Lifetime Kit",
    roleId: "1504932656876490762",
    rustGroup: "officer"
  }
});

function discordConfig() {
  return {
    tokens: [
      process.env.BTA_INFO_BOT_TOKEN,
      process.env.BTA_LINKING_BOT_TOKEN,
      process.env.DISCORD_BOT_TOKEN
    ].filter((token, index, values) => token && values.indexOf(token) === index),
    guildId: process.env.DISCORD_GUILD_ID || process.env.BTA_DISCORD_GUILD_ID
  };
}

async function discordRoleRequest(discordId, roleId, method) {
  const { tokens, guildId } = discordConfig();
  if (!tokens.length || !guildId || !discordId || !roleId) {
    throw new Error("Discord role synchronization is not configured");
  }

  let lastFailure = null;

  for (const token of tokens) {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
      {
        method,
        headers: { Authorization: `Bot ${token}` },
        cache: "no-store"
      }
    );

    if (response.ok) return;

    const detail = await response.text();
    lastFailure = new Error(
      `Discord role ${method} failed (${response.status}): ${detail}`
    );

    // A stale token should not prevent a correctly configured fallback bot
    // from applying the role.
    if (response.status !== 401 && response.status !== 403) {
      throw lastFailure;
    }
  }

  throw lastFailure || new Error(`Discord role ${method} failed`);
}

export async function addDiscordRole(discordId, roleId) {
  await discordRoleRequest(discordId, roleId, "PUT");
}

export async function removeDiscordRole(discordId, roleId) {
  await discordRoleRequest(discordId, roleId, "DELETE");
}

export async function syncLinkedIdentity({ steamId, discordId }) {
  if (!steamId || !discordId) return { linked: false, roles: [] };

  await addDiscordRole(discordId, VERIFIED_ROLE_ID);

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tebex_entitlements")
    .select("id, discord_role_id")
    .eq("steam_id", steamId)
    .eq("active", true);

  if (error) throw error;

  const roleIds = [...new Set((data || []).map((item) => item.discord_role_id).filter(Boolean))];
  const syncedAt = new Date().toISOString();

  for (const roleId of roleIds) {
    try {
      await addDiscordRole(discordId, roleId);
      await supabase
        .from("tebex_entitlements")
        .update({
          discord_sync_status: "synced",
          discord_synced_at: syncedAt,
          discord_sync_error: null,
          updated_at: syncedAt
        })
        .eq("steam_id", steamId)
        .eq("discord_role_id", roleId)
        .eq("active", true);
    } catch (error) {
      await supabase
        .from("tebex_entitlements")
        .update({
          discord_sync_status: "failed",
          discord_sync_error: String(error.message || error).slice(0, 1000),
          updated_at: syncedAt
        })
        .eq("steam_id", steamId)
        .eq("discord_role_id", roleId)
        .eq("active", true);
      throw error;
    }
  }

  return { linked: true, roles: roleIds };
}

export async function syncLinkedIdentityByKey(linkKey) {
  if (!linkKey) return { linked: false, roles: [] };

  const { data, error } = await getSupabase()
    .from("linked_accounts")
    .select("steam_id, discord_id")
    .eq("link_key", linkKey)
    .maybeSingle();

  if (error) throw error;
  return syncLinkedIdentity({
    steamId: data?.steam_id,
    discordId: data?.discord_id
  });
}

export function verifyTebexSignature(rawBody, signature) {
  const secret =
    process.env.TEBEX_WEBHOOK_SECRET ||
    process.env.BTA_TEBEX_WEBHOOK_SECRET ||
    process.env.TEBEX_SECRET;

  if (!secret || !signature) return false;

  const bodyHash = crypto.createHash("sha256").update(rawBody).digest("hex");
  const expected = crypto
    .createHmac("sha256", secret)
    .update(bodyHash)
    .digest("hex");

  const receivedBuffer = Buffer.from(String(signature).trim().toLowerCase(), "utf8");
  const expectedBuffer = Buffer.from(expected, "utf8");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

function firstSteamId(...values) {
  for (const value of values) {
    const match = String(value || "").match(/\b7656119\d{10}\b/);
    if (match) return match[0];
  }
  return null;
}

export function extractSteamId(payload, product = null) {
  const direct = firstSteamId(
    product?.username?.id,
    product?.username?.username,
    product?.steam_id,
    payload?.subject?.customer?.username?.id,
    payload?.subject?.customer?.username?.username,
    payload?.subject?.transaction?.username?.id,
    payload?.subject?.transaction?.username?.username,
    payload?.subject?.username?.id,
    payload?.subject?.username?.username,
    payload?.subject?.steam_id
  );
  if (direct) return direct;

  const queue = [payload?.subject];
  while (queue.length) {
    const current = queue.shift();
    if (!current || typeof current !== "object") continue;
    for (const [key, value] of Object.entries(current)) {
      if (/steam|username|ign|player/i.test(key)) {
        const found = firstSteamId(
          typeof value === "object" ? value?.id : value,
          typeof value === "object" ? value?.username : null
        );
        if (found) return found;
      }
      if (value && typeof value === "object") queue.push(value);
    }
  }
  return null;
}

function transactionIdFrom(payload) {
  return String(
    payload?.subject?.transaction?.id ||
      payload?.subject?.transaction?.transaction_id ||
      payload?.subject?.payment?.transaction_id ||
      payload?.subject?.id ||
      payload?.id ||
      ""
  );
}

function productsFrom(payload) {
  const products =
    payload?.subject?.products ||
    payload?.subject?.transaction?.products ||
    payload?.subject?.payment?.products ||
    [];
  return Array.isArray(products) ? products : [];
}

function packageIdFrom(product) {
  return String(
    product?.id ||
      product?.package?.id ||
      product?.package_id ||
      product?.packageId ||
      ""
  );
}

export async function processCompletedPayment(payload) {
  const supabase = getSupabase();
  const transactionId = transactionIdFrom(payload);
  if (!transactionId) throw new Error("Tebex payment is missing a transaction ID");

  const results = [];
  for (const product of productsFrom(payload)) {
    const packageId = packageIdFrom(product);
    const mapping = PACKAGE_ENTITLEMENTS[packageId];
    if (!mapping) continue;

    const steamId = extractSteamId(payload, product);
    if (!steamId) {
      throw new Error(`Tebex package ${packageId} is missing a SteamID64`);
    }

    const now = new Date().toISOString();
    const { data: entitlement, error } = await supabase
      .from("tebex_entitlements")
      .upsert(
        {
          transaction_id: transactionId,
          steam_id: steamId,
          package_id: packageId,
          package_name: product?.name || mapping.name,
          discord_role_id: mapping.roleId,
          rust_group: mapping.rustGroup,
          active: true,
          source_event_id: payload.id,
          discord_sync_status: "pending",
          updated_at: now
        },
        { onConflict: "transaction_id,steam_id,package_id" }
      )
      .select()
      .single();

    if (error) throw error;

    const { data: account, error: accountError } = await supabase
      .from("linked_accounts")
      .select("discord_id")
      .eq("steam_id", steamId)
      .maybeSingle();

    if (accountError) throw accountError;
    if (account?.discord_id) {
      await syncLinkedIdentity({ steamId, discordId: account.discord_id });
    }

    results.push(entitlement);
  }

  return { transactionId, entitlements: results };
}

export async function revokeTransaction(payload) {
  const transactionId = transactionIdFrom(payload);
  if (!transactionId) return { transactionId: null, revoked: 0 };

  const supabase = getSupabase();
  const { data: rows, error } = await supabase
    .from("tebex_entitlements")
    .select("id, steam_id, discord_role_id")
    .eq("transaction_id", transactionId)
    .eq("active", true);

  if (error) throw error;

  const now = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("tebex_entitlements")
    .update({ active: false, updated_at: now })
    .eq("transaction_id", transactionId);
  if (updateError) throw updateError;

  for (const row of rows || []) {
    const { count, error: countError } = await supabase
      .from("tebex_entitlements")
      .select("id", { count: "exact", head: true })
      .eq("steam_id", row.steam_id)
      .eq("discord_role_id", row.discord_role_id)
      .eq("active", true);
    if (countError) throw countError;
    if (count) continue;

    const { data: account } = await supabase
      .from("linked_accounts")
      .select("discord_id")
      .eq("steam_id", row.steam_id)
      .maybeSingle();
    if (account?.discord_id) {
      await removeDiscordRole(account.discord_id, row.discord_role_id);
    }
  }

  return { transactionId, revoked: rows?.length || 0 };
}
