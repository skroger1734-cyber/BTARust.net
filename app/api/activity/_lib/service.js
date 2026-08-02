import crypto from "node:crypto";
import { createRequire } from "node:module";
import { NextResponse } from "next/server";
import {
  SITE_URL,
  createMiniGamesLinkTicket,
  getSupabase
} from "../../auth/_utils/linking";

const require = createRequire(import.meta.url);
const config = require("./giveaways.json");
const { newSession, applyMove } = require("./games.cjs");

const KIT_GROUPS = new Set([
  "vip",
  "recruit",
  "enlistment",
  "builder",
  "farm",
  "electrical",
  "soldier",
  "officer",
  "general"
]);
const SERVER_KEYS = ["US", "EU", "TEST"];
const EASTERN_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

function json(body, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

function easternParts(date) {
  return Object.fromEntries(
    EASTERN_PARTS.formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function easternTimeToUtc(year, monthIndex, day, hour) {
  const guess = Date.UTC(year, monthIndex, day, hour);
  const local = easternParts(new Date(guess));
  const offset = Date.UTC(
    local.year,
    local.month - 1,
    local.day,
    local.hour,
    local.minute,
    local.second,
  ) - guess;
  return new Date(guess - offset);
}

function firstThursday(year, monthIndex) {
  const firstWeekday = new Date(Date.UTC(year, monthIndex, 1)).getUTCDay();
  return 1 + ((4 - firstWeekday + 7) % 7);
}

function giveawayPeriod(date = new Date()) {
  const eastern = easternParts(date);
  let year = eastern.year;
  let monthIndex = eastern.month - 1;
  let start = easternTimeToUtc(year, monthIndex, firstThursday(year, monthIndex), 14);

  if (date < start) {
    const previous = new Date(Date.UTC(year, monthIndex - 1, 1));
    year = previous.getUTCFullYear();
    monthIndex = previous.getUTCMonth();
    start = easternTimeToUtc(year, monthIndex, firstThursday(year, monthIndex), 14);
  }

  const following = new Date(Date.UTC(year, monthIndex + 1, 1));
  const endYear = following.getUTCFullYear();
  const endMonth = following.getUTCMonth();
  return {
    key: `${year}-${String(monthIndex + 1).padStart(2, "0")}`,
    start,
    end: easternTimeToUtc(endYear, endMonth, firstThursday(endYear, endMonth), 14),
  };
}

function monthKey(date = new Date()) {
  return giveawayPeriod(date).key;
}

function rewardImageUrl(reward) {
  const image = config.rewardCatalog[reward?.reward_id]?.image;
  return image ? new URL(image, "https://btarust.net").toString() : "https://btarust.net/assets/bta-icon.png";
}

function accountCreatedAt(discordId) {
  return new Date(Number((BigInt(discordId) >> 22n) + 1420070400000n));
}

function publicSession(session) {
  const base = {
    id: session.id,
    gameId: session.gameId,
    startedAt: session.startedAt,
    expiresAt: session.expiresAt
  };
  if (session.gameId === "locked_crate") {
    const signals = session.state.signals || [];
    const latest = signals.at(-1);
    return {
      ...base,
      crateCount: session.state.crateCount || 5,
      maxScans: session.state.maxScans || 2,
      scans: session.state.scans || [],
      signals,
      lastSignal: latest ? `Crate ${latest.crate + 1}: ${latest.signal}` : null
    };
  }
  if (session.gameId === "code_raid") {
    return {
      ...base,
      codeLength: session.state.code?.length || 4,
      maxGuesses: session.state.maxGuesses || 6,
      guesses: session.state.hintHistory || []
    };
  }
  if (session.gameId === "monument_quiz") {
    const question = session.state.questions[session.state.step];
    return {
      ...base,
      question: question?.question || null,
      answers: question?.answers || [],
      step: session.state.step,
      correct: session.state.correct,
      questionCount: session.state.questions.length
    };
  }
  if (session.gameId === "minefield") {
    return {
      ...base,
      row: session.state.row,
      rowCount: session.state.traps.length,
      widths: session.state.widths || [5, 4, 3],
      readings: session.state.readings[session.state.row] || []
    };
  }
  if (session.gameId === "high_low") {
    return {
      ...base,
      current: session.state.current,
      minCard: session.state.minCard || 1,
      maxCard: session.state.maxCard || 13,
      streak: session.state.streak,
      targetStreak: session.state.targetStreak || 7,
      shieldAvailable: session.state.shieldAvailable
    };
  }
  if (session.gameId === "nuclear_override") {
    return {
      ...base,
      sequence: session.state.sequence,
      step: session.state.step,
      phase: session.state.phase
    };
  }
  return base;
}

function sessionFromRow(saved) {
  return {
    id: saved.id,
    userId: saved.discord_id,
    gameId: saved.game_id,
    state: saved.state,
    outcome: saved.outcome,
    startedAt: saved.started_at,
    expiresAt: saved.expires_at
  };
}

async function discordIdentity(request) {
  const accessToken = String(request.headers.get("authorization") || "")
    .replace(/^Bearer\s+/i, "");
  if (!accessToken) throw Object.assign(new Error("Discord authentication required."), { status: 401 });
  const response = await fetch("https://discord.com/api/v10/users/@me", {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!response.ok) {
    throw Object.assign(new Error("Invalid Discord Activity session."), { status: 401 });
  }
  return response.json();
}

function discordAdminConfig() {
  return {
    guildId: process.env.BTA_DISCORD_GUILD_ID || process.env.DISCORD_GUILD_ID || "",
    tokens: [
      process.env.BTA_GIVEAWAYS_BOT_TOKEN,
      process.env.BTA_INFO_BOT_TOKEN,
      process.env.BTA_LINKING_BOT_TOKEN,
      process.env.DISCORD_BOT_TOKEN
    ].filter((token, index, values) => token && values.indexOf(token) === index),
    roleIds: [
      process.env.BTA_DISCORD_ADMIN_ROLE_ID,
      process.env.BTA_DISCORD_STAFF_ROLE_ID,
      process.env.DISCORD_ADMIN_ROLE_ID,
      process.env.DISCORD_STAFF_ROLE_ID
    ].filter(Boolean)
  };
}

async function discordBotJson(path) {
  const { tokens } = discordAdminConfig();
  let lastError = null;
  for (const token of tokens) {
    const response = await fetch(`https://discord.com/api/v10${path}`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store"
    });
    if (response.ok) return response.json();
    lastError = new Error(`Discord staff lookup failed (${response.status}).`);
    if (response.status !== 401 && response.status !== 403) break;
  }
  throw lastError || new Error("Discord staff lookup is not configured.");
}

async function isGiveawayAdmin(discordId) {
  const { guildId, tokens, roleIds } = discordAdminConfig();
  if (!guildId || !tokens.length || !discordId) return false;
  const [member, roles, guild] = await Promise.all([
    discordBotJson(`/guilds/${guildId}/members/${discordId}`),
    discordBotJson(`/guilds/${guildId}/roles`),
    discordBotJson(`/guilds/${guildId}`)
  ]);
  if (guild.owner_id === discordId) return true;

  const memberRoleIds = new Set([guildId, ...(member.roles || [])]);
  if (roleIds.some((roleId) => memberRoleIds.has(roleId))) return true;

  const permissions = (roles || [])
    .filter((role) => memberRoleIds.has(role.id))
    .reduce((combined, role) => combined | BigInt(role.permissions || "0"), 0n);
  const administrator = 1n << 3n;
  const manageGuild = 1n << 5n;
  return Boolean(permissions & (administrator | manageGuild));
}

async function linkedAccount(discordId) {
  const { data, error } = await getSupabase()
    .from("linked_accounts")
    .select("steam_id, discord_id, discord_username, discord_global_name, tebex_username")
    .eq("discord_id", discordId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

function miniGamesLinkUrl(discordId) {
  const url = new URL("/api/auth/minigames-link", SITE_URL);
  url.searchParams.set("ticket", createMiniGamesLinkTicket(discordId));
  return url.toString();
}

async function audit(discordId, event, payload = {}) {
  const { error } = await getSupabase().from("giveaway_audit").insert({
    discord_id: discordId || null,
    event,
    payload
  });
  if (error) console.error("[giveaways] audit insert failed", error.message);
}

function configuredServers() {
  const rewardServers = new Set(
    String(process.env.BTA_GIVEAWAYS_REWARD_SERVERS || "US")
      .split(",")
      .map((key) => key.trim().toUpperCase())
      .filter((key) => SERVER_KEYS.includes(key))
  );
  return SERVER_KEYS.filter((key) =>
    rewardServers.has(key) &&
    process.env[`BTA_RCON_${key}_HOST`] &&
    process.env[`BTA_RCON_${key}_PORT`] &&
    process.env[`BTA_RCON_${key}_PASSWORD`]
  );
}

function rconCommand(serverKey, message, timeoutMs = 12000) {
  const host = process.env[`BTA_RCON_${serverKey}_HOST`];
  const port = process.env[`BTA_RCON_${serverKey}_PORT`];
  const password = process.env[`BTA_RCON_${serverKey}_PASSWORD`];
  if (!host || !port || !password) {
    return Promise.reject(new Error(`${serverKey} RCON is not configured.`));
  }
  const identifier = crypto.randomInt(1, 2_000_000_000);
  const url = `ws://${host}:${port}/${encodeURIComponent(password)}`;
  return new Promise((resolve, reject) => {
    let settled = false;
    const socket = new WebSocket(url);
    const timer = setTimeout(() => finish(new Error(`${serverKey} RCON timed out.`)), timeoutMs);
    function finish(error, result = "") {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      try { socket.close(); } catch {}
      if (error) reject(error);
      else resolve(result);
    }
    socket.addEventListener("open", () => {
      try {
        socket.send(JSON.stringify({
          Identifier: identifier,
          Message: message,
          Name: "WebRcon"
        }));
      } catch (error) {
        finish(error);
      }
    });
    socket.addEventListener("message", (event) => {
      try {
        const envelope = JSON.parse(String(event.data));
        if (envelope.Identifier === identifier) finish(null, String(envelope.Message || ""));
      } catch (error) {
        finish(error);
      }
    });
    socket.addEventListener("error", () => finish(new Error(`${serverKey} RCON connection failed.`)), { once: true });
    socket.addEventListener("close", () => {
      if (!settled) finish(new Error(`${serverKey} RCON closed before replying.`));
    }, { once: true });
  });
}

function assertSteamId(steamId) {
  if (!/^7656119\d{10}$/.test(String(steamId))) throw new Error("Invalid linked SteamID64.");
}

async function grantCaseKeys(reward, steamId) {
  assertSteamId(steamId);
  const servers = configuredServers();
  if (!servers.length) throw new Error("No BTA RCON servers are configured.");
  const results = await Promise.allSettled(
    servers.map((server) => rconCommand(server, `cases.give ${steamId} keys ${reward.quantity}`))
  );
  const granted = servers.filter((server, index) => results[index].status === "fulfilled");
  const failed = servers.filter((server, index) => results[index].status === "rejected");
  if (failed.length) {
    const error = new Error(`Case key delivery failed on: ${failed.join(", ")}.`);
    error.servers = granted;
    throw error;
  }
  return { servers: granted };
}

async function grantKit(reward, steamId) {
  assertSteamId(steamId);
  if (!/^kits\.[a-z0-9._-]+$/.test(reward.permission)) throw new Error("Unsafe kit permission.");
  const group = `giveaway_${reward.id.replaceAll("-", "").slice(0, 20)}`;
  const servers = configuredServers();
  if (!servers.length) throw new Error("No BTA RCON servers are configured.");
  const results = await Promise.allSettled(servers.map(async (server) => {
    try {
      await rconCommand(server, `oxide.group add ${group}`);
      await rconCommand(server, `oxide.grant group ${group} ${reward.permission}`);
      await rconCommand(server, `oxide.usergroup add ${steamId} ${group}`);
      return server;
    } catch (error) {
      await Promise.allSettled([
        rconCommand(server, `oxide.usergroup remove ${steamId} ${group}`),
        rconCommand(server, `oxide.group remove ${group}`)
      ]);
      throw error;
    }
  }));
  const granted = results
    .filter((result) => result.status === "fulfilled")
    .map((result) => result.value);
  const failed = servers.filter((server, index) => results[index].status === "rejected");
  if (failed.length) {
    await Promise.allSettled(granted.map(async (server) => {
      await rconCommand(server, `oxide.usergroup remove ${steamId} ${group}`);
      await rconCommand(server, `oxide.group remove ${group}`);
    }));
    const error = new Error(`Kit delivery failed on: ${failed.join(", ")}.`);
    error.servers = [];
    throw error;
  }
  return { group, servers: granted };
}

async function createTebexCoupon(reward, account) {
  const secret = process.env.BTA_TEBEX_PRIVATE_KEY;
  if (!secret) throw new Error("Tebex coupon API is not configured.");
  const code = `BTA10-${monthKey().replace("-", "")}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  const expires = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
  const response = await fetch("https://plugin.tebex.io/coupons", {
    method: "POST",
    headers: {
      "X-Tebex-Secret": secret,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code,
      effective_on: "cart",
      packages: [],
      categories: [],
      discount_type: "percentage",
      discount_amount: 0,
      discount_percentage: 10,
      redeem_unlimited: false,
      expire_never: false,
      expire_limit: 1,
      expire_date: expires,
      start_date: new Date().toISOString().slice(0, 10),
      basket_type: "both",
      minimum: 0,
      discount_application_method: 1,
      username: account.tebex_username || "",
      note: `BTA Monthly Ops reward ${reward.id} for Steam ${reward.steam_id}`
    }),
    cache: "no-store"
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Tebex coupon creation failed (${response.status}).`);
  }
  return { code, couponId: String(payload?.data?.id || payload?.id || "") };
}

function webhookSettings() {
  try {
    return JSON.parse(process.env.BTA_GIVEAWAYS_LOG_WEBHOOKS_JSON || "{}").webhooks || {};
  } catch {
    return {};
  }
}

async function sendWebhook(key, embed, userId = null) {
  const url = webhookSettings()[key]?.url;
  if (!url) {
    console.error("[giveaways:webhook] missing target", { key });
    return false;
  }
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: key === "public_winners" ? "BTA Giveaways" : "BTA Mini-Games Logger",
        embeds: [embed],
        allowed_mentions: userId ? { parse: [], users: [userId] } : { parse: [] }
      })
    });
    if (!response.ok) {
      console.error("[giveaways:webhook] delivery failed", {
        key,
        status: response.status,
        detail: (await response.text()).slice(0, 300)
      });
    }
    return response.ok;
  } catch (error) {
    console.error("[giveaways:webhook] request failed", { key, error: String(error) });
    return false;
  }
}

async function logEvent(gameId, title, identity, fields, color = 0xe03124) {
  const embed = {
    title,
    color,
    timestamp: new Date().toISOString(),
    fields: [
      { name: "Player", value: `<@${identity.id}>`, inline: true },
      ...fields
    ],
    footer: { text: "BTA verified live Activity data" }
  };
  await sendWebhook(gameId, embed, identity.id);
}

async function dmWinner(identity, account, reward) {
  const token = process.env.BTA_GIVEAWAYS_BOT_TOKEN;
  if (!token) throw new Error("Giveaways bot token is not configured.");
  const channelResponse = await fetch("https://discord.com/api/v10/users/@me/channels", {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ recipient_id: identity.id })
  });
  if (!channelResponse.ok) throw new Error("Discord DM channel could not be opened.");
  const channel = await channelResponse.json();
  const lines = [
    "🏆 **BTA Monthly Ops — You won!**",
    "",
    `**Prize:** ${reward.name}`,
    `**Winning game:** ${reward.game_id.replaceAll("_", " ")}`,
    `**Linked Steam:** \`${account.steam_id}\``,
    `**Prize ticket:** \`${reward.id}\``,
    ""
  ];
  if (reward.type === "tebex_code") {
    lines.push(
      `**Your private single-use code:** \`${reward.secret}\``,
      "Redeem it during checkout in the BTA Tebex store. The code is worth 10% and can be used once."
    );
  } else if (reward.type === "kit" && reward.status === "delivered") {
    lines.push(
      "Your kit was granted automatically on the live BTA reward server.",
      `Use \`/kits\` in game. Access expires <t:${Math.floor(new Date(reward.expires_at).getTime() / 1000)}:F>.`
    );
  } else if (reward.type === "case_keys" && reward.status === "delivered") {
    lines.push(
      `${reward.quantity} case keys were granted automatically to your linked Steam account.`,
      "Join BTA and use `/cases` to see the updated balance."
    );
  } else {
    lines.push("The prize is recorded and staff can trace its delivery using the ticket above.");
  }
  const messageResponse = await fetch(`https://discord.com/api/v10/channels/${channel.id}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: lines.join("\n"),
      embeds: [{
        title: `\u{1F381} ${reward.name}`,
        color: reward.status === "delivered" ? 0x2ecc71 : 0xf4b400,
        thumbnail: { url: rewardImageUrl(reward) },
        fields: [
          { name: "Delivery", value: reward.status === "delivered" ? "Confirmed" : "Recorded and traceable", inline: true },
          { name: "Ticket", value: reward.id, inline: false }
        ],
        footer: { text: "Private BTA Monthly Ops reward" },
        timestamp: new Date().toISOString()
      }],
      allowed_mentions: { parse: [] }
    })
  });
  if (!messageResponse.ok) throw new Error("Discord winner DM failed.");
}

async function hasOwnedTierKit(discordId, steamId) {
  const client = getSupabase();
  const now = new Date();
  const [{ data: entitlements, error: entitlementError }, { data: rewards, error: rewardError }] =
    await Promise.all([
      client
        .from("tebex_entitlements")
        .select("rust_group")
        .eq("steam_id", steamId)
        .eq("active", true),
      client
        .from("giveaway_rewards")
        .select("status, expires_at")
        .eq("discord_id", discordId)
        .eq("type", "kit")
        .neq("status", "void")
    ]);
  if (entitlementError) throw entitlementError;
  if (rewardError) throw rewardError;
  return Boolean(
    (entitlements || []).some((item) => KIT_GROUPS.has(String(item.rust_group || "").toLowerCase())) ||
    (rewards || []).some((reward) =>
      reward.status !== "expired" &&
      (!reward.expires_at || new Date(reward.expires_at) > now)
    )
  );
}

async function drawReward(gameId, discordId, steamId) {
  const client = getSupabase();
  const month = monthKey();
  const { data: issued, error } = await client
    .from("giveaway_rewards")
    .select("discord_id, reward_id, status")
    .eq("attempt_month", month)
    .neq("status", "void");
  if (error) throw error;
  const usage = new Map();
  const awardedToPlayer = new Set();
  for (const item of issued || []) {
    usage.set(item.reward_id, (usage.get(item.reward_id) || 0) + 1);
    if (item.discord_id === discordId && item.reward_id) awardedToPlayer.add(item.reward_id);
  }
  const ownsKit = await hasOwnedTierKit(discordId, steamId);
  const entries = config.rewardTables[config.games[gameId].rewardTable].filter((entry) => {
    const reward = config.rewardCatalog[entry.reward];
    if ((usage.get(entry.reward) || 0) >= reward.monthlyStock) return false;
    if (awardedToPlayer.has(entry.reward)) return false;
    if (reward.type === "kit" && ownsKit) return false;
    return true;
  });
  if (!entries.length) return null;
  const total = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = crypto.randomInt(total);
  for (const entry of entries) {
    if (roll < entry.weight) return { id: entry.reward, ...config.rewardCatalog[entry.reward] };
    roll -= entry.weight;
  }
  const last = entries.at(-1);
  return { id: last.reward, ...config.rewardCatalog[last.reward] };
}

async function fulfillReward(reward, account) {
  const client = getSupabase();
  let patch = {};
  try {
    if (reward.type === "case_keys") {
      const result = await grantCaseKeys(reward, account.steam_id);
      patch = {
        status: "delivered",
        delivered_at: new Date().toISOString(),
        fulfillment_servers: result.servers
      };
    } else if (reward.type === "kit") {
      const result = await grantKit(reward, account.steam_id);
      const delivered = new Date();
      patch = {
        status: "delivered",
        delivered_at: delivered.toISOString(),
        expires_at: new Date(delivered.getTime() + reward.duration_days * 86400000).toISOString(),
        fulfillment_group: result.group,
        fulfillment_servers: result.servers
      };
    } else if (reward.type === "tebex_code") {
      const result = await createTebexCoupon(reward, account);
      patch = {
        status: "delivered",
        delivered_at: new Date().toISOString(),
        secret: result.code,
        tebex_coupon_id: result.couponId
      };
    }
  } catch (error) {
    patch = {
      status: "pending",
      fulfillment_servers: error.servers || [],
      fulfillment_error: String(error.message || error).slice(0, 500)
    };
  }
  const { data, error } = await client
    .from("giveaway_rewards")
    .update(patch)
    .eq("id", reward.id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

async function waitForAutomaticDelivery(rewardId, timeoutMs = 25_000) {
  const client = getSupabase();
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const { data, error } = await client
      .from("giveaway_rewards")
      .select("*")
      .eq("id", rewardId)
      .single();
    if (error) throw error;
    if (data.status === "delivered") return data;
    if (["void", "expired"].includes(data.status)) return data;
  }
  return null;
}

export async function exchangeToken(request) {
  try {
    const { code, redirectUri } = await request.json();
    if (!code) return json({ error: "Discord authorization code is required." }, 400);
    const allowedRedirects = new Set([
      "https://btarust.net/minigames",
      "https://www.btarust.net/minigames",
      "https://minigames.btarust.net/"
    ]);
    if (redirectUri && !allowedRedirects.has(redirectUri)) {
      return json({ error: "Discord redirect URI is not allowed." }, 400);
    }
    const body = new URLSearchParams({
      client_id: process.env.BTA_GIVEAWAYS_APPLICATION_ID || "",
      client_secret: process.env.BTA_GIVEAWAYS_CLIENT_SECRET || "",
      grant_type: "authorization_code",
      code: String(code)
    });
    if (redirectUri) body.set("redirect_uri", redirectUri);
    const response = await fetch("https://discord.com/api/v10/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store"
    });
    const payload = await response.json();
    return json(payload, response.status);
  } catch (error) {
    console.error("[giveaways] token exchange failed", error);
    return json({ error: "Discord Activity authentication failed." }, 503);
  }
}

export async function getProfile(request) {
  try {
    const identity = await discordIdentity(request);
    const account = await linkedAccount(identity.id);
    const month = monthKey();
    const today = new Date().toISOString().slice(0, 10);
    const { data: attempts, error } = await getSupabase()
      .from("giveaway_attempts")
      .select("game_id, attempt_day, outcome, started_at, completed_at, reward_id")
      .eq("discord_id", identity.id)
      .eq("attempt_month", month)
      .order("started_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    const { data: rewards, error: rewardsError } = await getSupabase()
      .from("giveaway_rewards")
      .select("id, game_id, name, status, awarded_at")
      .eq("discord_id", identity.id)
      .eq("attempt_month", month);
    if (rewardsError) throw rewardsError;
    const rewardById = new Map((rewards || []).map((item) => [item.id, item]));
    const wins = (attempts || []).filter((item) => item.outcome === "win").length;
    const losses = (attempts || []).filter((item) => item.outcome === "loss").length;
    const gameStatus = Object.fromEntries(Object.keys(config.games).map((gameId) => {
      const gameAttempts = (attempts || []).filter((item) => item.game_id === gameId);
      const wonThisMonth = gameAttempts.some((item) => item.outcome === "win");
      const usedToday = gameAttempts.some((item) => item.attempt_day === today);
      return [gameId, {
        state: wonThisMonth ? "won_month" : usedToday ? "used_today" : "available",
        canPlay: !wonThisMonth && !usedToday,
        usedToday,
        wonThisMonth
      }];
    }));
    const admin = await isGiveawayAdmin(identity.id).catch((error) => {
      console.error("[giveaways] admin lookup failed", error.message);
      return false;
    });
    return json({
      linked: Boolean(account?.steam_id),
      steamId: account?.steam_id || null,
      linkUrl: miniGamesLinkUrl(identity.id),
      admin,
      discordUser: {
        id: identity.id,
        username: identity.username,
        globalName: identity.global_name || null,
        avatar: identity.avatar || null
      },
      tries: (attempts || []).length,
      wins,
      losses,
      monthlyWins: wins,
      gameStatus,
      history: (attempts || []).map((item) => ({
        gameId: item.game_id,
        outcome: item.outcome,
        startedAt: item.started_at,
        reward: rewardById.get(item.reward_id)?.name || null
      }))
    });
  } catch (error) {
    console.error("[giveaways] profile failed", error);
    return json({ error: error.message || "Profile unavailable." }, error.status || 503);
  }
}

export async function getFeatured() {
  try {
    const now = new Date();
    const currentWeekStart = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - ((now.getUTCDay() + 6) % 7),
    ));
    const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 86400000);
    let statisticsStart = previousWeekStart;
    let statisticsEnd = currentWeekStart;
    const client = getSupabase();
    let { data: attempts, error: attemptsError } = await client
      .from("giveaway_attempts")
      .select("game_id")
      .gte("started_at", previousWeekStart.toISOString())
      .lt("started_at", currentWeekStart.toISOString());
    if (attemptsError) throw attemptsError;
    if (!attempts?.length) {
      const fallbackStart = new Date(now.getTime() - 28 * 86400000);
      const fallback = await client
        .from("giveaway_attempts")
        .select("game_id")
        .gte("started_at", fallbackStart.toISOString())
        .lte("started_at", now.toISOString());
      if (fallback.error) throw fallback.error;
      attempts = fallback.data || [];
      statisticsStart = fallbackStart;
      statisticsEnd = now;
    }
    const counts = Object.fromEntries(Object.keys(config.games).map((id) => [id, 0]));
    for (const attempt of attempts || []) {
      if (Object.hasOwn(counts, attempt.game_id)) counts[attempt.game_id] += 1;
    }
    const featuredGameId = Object.keys(config.games).sort(
      (left, right) => counts[right] - counts[left] || left.localeCompare(right),
    )[0];

    const { data: rewards, error: rewardsError } = await client
      .from("giveaway_rewards")
      .select("id, game_id, name, awarded_at")
      .neq("status", "void")
      .not("awarded_at", "is", null)
      .order("awarded_at", { ascending: false })
      .limit(10);
    if (rewardsError) throw rewardsError;
    const currentPeriod = giveawayPeriod(now);
    const currentMonth = currentPeriod.key;
    const monthStart = currentPeriod.start.toISOString();
    const nextMonthStart = currentPeriod.end.toISOString();
    // A completed winning session is the durable source of truth for the public
    // counter. Reward fulfillment can fail independently and must never hide a win.
    const [totalWinnersResult, monthlyWinnersResult] = await Promise.all([
      client
        .from("giveaway_sessions")
        .select("id", { count: "exact", head: true })
        .eq("outcome", "win"),
      client
        .from("giveaway_sessions")
        .select("id", { count: "exact", head: true })
        .eq("outcome", "win")
        .gte("completed_at", monthStart)
        .lt("completed_at", nextMonthStart),
    ]);
    if (totalWinnersResult.error) throw totalWinnersResult.error;
    if (monthlyWinnersResult.error) throw monthlyWinnersResult.error;
    const rewardIds = (rewards || []).map((reward) => reward.id);
    let winnerByReward = new Map();
    if (rewardIds.length) {
      const { data: winnerAttempts, error: winnerError } = await client
        .from("giveaway_attempts")
        .select("reward_id, discord_username")
        .in("reward_id", rewardIds);
      if (winnerError) throw winnerError;
      winnerByReward = new Map(
        (winnerAttempts || []).map((attempt) => [
          attempt.reward_id,
          attempt.discord_username || "BTA Player",
        ]),
      );
    }
    return json({
      featuredGameId,
      featuredGameName: config.games[featuredGameId].name,
      plays: counts[featuredGameId],
      basedOn: {
        startsAt: statisticsStart.toISOString(),
        endsAt: statisticsEnd.toISOString(),
      },
      winnerStats: {
        total: totalWinnersResult.count || 0,
        monthly: monthlyWinnersResult.count || 0,
        month: currentMonth,
      },
      winners: (rewards || []).map((reward) => ({
        playerName: winnerByReward.get(reward.id) || "BTA Player",
        gameId: reward.game_id,
        gameName: config.games[reward.game_id]?.name || reward.game_id,
        prize: reward.name,
        awardedAt: reward.awarded_at,
      })),
    });
  } catch (error) {
    console.error("[giveaways] featured failed", error);
    return json({ error: "Featured operation is temporarily unavailable." }, 503);
  }
}

export async function startGame(request) {
  try {
    const identity = await discordIdentity(request);
    const { gameId } = await request.json();
    if (!config.games[gameId]) return json({ error: "Unknown game." }, 400);
    const account = await linkedAccount(identity.id);
    if (!account?.steam_id) {
      return json({
        code: "LINK_REQUIRED",
        error: "Link Discord and Steam before playing for a real prize.",
        linkUrl: miniGamesLinkUrl(identity.id)
      }, 403);
    }
    if (Date.now() - accountCreatedAt(identity.id).getTime() < config.rules.minimumAccountAgeDays * 86400000) {
      return json({ error: `Discord accounts must be at least ${config.rules.minimumAccountAgeDays} days old.` }, 403);
    }
    const month = monthKey();
    const today = new Date().toISOString().slice(0, 10);
    const client = getSupabase();
    const { count: monthlyWins, error: winError } = await getSupabase()
      .from("giveaway_attempts")
      .select("id", { count: "exact", head: true })
      .eq("discord_id", identity.id)
      .eq("game_id", gameId)
      .eq("attempt_month", month)
      .eq("outcome", "win");
    if (winError) throw winError;
    if (monthlyWins) return json({ error: "This game was already won this month." }, 429);

    const { data: activeAttempt, error: activeAttemptError } = await client
      .from("giveaway_attempts")
      .select("session_id")
      .eq("discord_id", identity.id)
      .eq("game_id", gameId)
      .eq("attempt_day", today)
      .eq("outcome", "playing")
      .maybeSingle();
    if (activeAttemptError) throw activeAttemptError;
    if (activeAttempt?.session_id) {
      const { data: activeSaved, error: activeSessionError } = await client
        .from("giveaway_sessions")
        .select("*")
        .eq("id", activeAttempt.session_id)
        .eq("discord_id", identity.id)
        .eq("outcome", "playing")
        .maybeSingle();
      if (activeSessionError) throw activeSessionError;
      if (activeSaved && new Date(activeSaved.expires_at) > new Date()) {
        const activeSession = sessionFromRow(activeSaved);
        await audit(identity.id, "game.resumed", { gameId, sessionId: activeSession.id });
        return json({ session: publicSession(activeSession), resumed: true });
      }
    }

    const session = newSession(identity.id, gameId, config, new Date());
    const { error: sessionError } = await client.from("giveaway_sessions").insert({
      id: session.id,
      discord_id: identity.id,
      game_id: gameId,
      state: session.state,
      outcome: "playing",
      started_at: session.startedAt,
      expires_at: session.expiresAt
    });
    if (sessionError) throw sessionError;
    const { error: attemptError } = await client.from("giveaway_attempts").insert({
      session_id: session.id,
      discord_id: identity.id,
      discord_username: identity.global_name || identity.username,
      steam_id: account.steam_id,
      game_id: gameId,
      attempt_month: month,
      started_at: session.startedAt
    });
    if (attemptError) {
      await client.from("giveaway_sessions").delete().eq("id", session.id);
      if (attemptError.code === "23505") {
        return json({ error: "Today's attempt for this game has already been used." }, 429);
      }
      throw attemptError;
    }
    await audit(identity.id, "game.started", { gameId, sessionId: session.id });
    await logEvent(gameId, "🎮 Attempt started", identity, [
      { name: "Game", value: config.games[gameId].name, inline: true },
      { name: "Steam", value: account.steam_id, inline: true },
      { name: "Session", value: session.id, inline: false }
    ], 0xf59e0b);
    return json({ session: publicSession(session) });
  } catch (error) {
    console.error("[giveaways] start failed", error);
    return json({ error: error.message || "Game could not be started." }, error.status || 503);
  }
}

export async function moveGame(request) {
  try {
    const identity = await discordIdentity(request);
    const { sessionId, move } = await request.json();
    const client = getSupabase();
    const { data: saved, error: sessionError } = await client
      .from("giveaway_sessions")
      .select("*")
      .eq("id", sessionId)
      .eq("discord_id", identity.id)
      .maybeSingle();
    if (sessionError) throw sessionError;
    if (!saved) return json({ error: "Game session not found." }, 404);
    if (saved.outcome !== "playing") return json({ error: "This game is already finished." }, 400);
    if (new Date(saved.expires_at) <= new Date()) {
      await client.from("giveaway_sessions").update({ outcome: "expired" }).eq("id", sessionId);
      await client.from("giveaway_attempts").update({ outcome: "expired", completed_at: new Date().toISOString() }).eq("session_id", sessionId);
      return json({ error: "Game session expired." }, 400);
    }
    const session = sessionFromRow(saved);
    const outcome = applyMove(session, move, config);
    if (outcome.error) return json({ error: outcome.error }, 400);
    const now = new Date().toISOString();
    const nextOutcome = outcome.finished ? (outcome.won ? "win" : "loss") : "playing";
    const { error: updateError } = await client.from("giveaway_sessions").update({
      state: session.state,
      outcome: nextOutcome,
      completed_at: outcome.finished ? now : null,
      updated_at: now
    }).eq("id", sessionId);
    if (updateError) throw updateError;
    await audit(identity.id, "game.move", {
      gameId: session.gameId,
      sessionId,
      move,
      finished: Boolean(outcome.finished),
      won: Boolean(outcome.won)
    });
    await logEvent(session.gameId, outcome.finished ? "🏁 Attempt completed" : "🕹️ Move recorded", identity, [
      { name: "Outcome", value: outcome.finished ? nextOutcome.toUpperCase() : "PLAYING", inline: true },
      { name: "Message", value: outcome.message || "Move accepted", inline: false }
    ], outcome.won ? 0x22c55e : outcome.finished ? 0xdc2626 : 0x3b82f6);
    if (!outcome.finished) {
      return json({
        session: publicSession(session),
        result: null,
        message: outcome.message || null
      });
    }

    const { error: attemptUpdateError } = await client.from("giveaway_attempts").update({
      outcome: nextOutcome,
      completed_at: now
    }).eq("session_id", sessionId);
    if (attemptUpdateError) throw attemptUpdateError;
    if (!outcome.won) {
      return json({
        session: publicSession(session),
        result: { won: false, message: outcome.message || null },
        reward: null
      });
    }

    const account = await linkedAccount(identity.id);
    const { data: existingReward, error: existingRewardError } = await client
      .from("giveaway_rewards")
      .select("*")
      .eq("discord_id", identity.id)
      .eq("game_id", session.gameId)
      .eq("attempt_month", monthKey())
      .neq("status", "void")
      .maybeSingle();
    if (existingRewardError) throw existingRewardError;
    if (existingReward) {
      const { error: attachExistingRewardError } = await client.from("giveaway_attempts")
        .update({ reward_id: existingReward.id })
        .eq("session_id", sessionId);
      if (attachExistingRewardError) throw attachExistingRewardError;
      await audit(identity.id, "reward.reused_after_attempt_reset", {
        rewardId: existingReward.id,
        gameId: session.gameId,
        sessionId
      });
      return json({
        session: publicSession(session),
        result: {
          won: true,
          message: `${outcome.message || "Operation complete."} Your existing monthly prize remains attached to this game.`,
          ticket: existingReward.id
        },
        reward: {
          id: existingReward.id,
          name: existingReward.name,
          type: existingReward.type,
          status: existingReward.status,
          dmSent: existingReward.dm_status === "sent"
        }
      });
    }

    const selected = await drawReward(session.gameId, identity.id, account.steam_id);
    const rewardId = crypto.randomUUID();
    const rewardValues = selected ? {
      id: rewardId,
      discord_id: identity.id,
      steam_id: account.steam_id,
      game_id: session.gameId,
      reward_id: selected.id,
      name: selected.name,
      type: selected.type,
      quantity: selected.quantity || null,
      permission: selected.permission || null,
      duration_days: selected.durationDays || null,
      attempt_month: monthKey(),
      status: "fulfilling"
    } : {
      id: rewardId,
      discord_id: identity.id,
      steam_id: account.steam_id,
      game_id: session.gameId,
      reward_id: null,
      name: "Staff-selected replacement prize",
      type: "manual",
      attempt_month: monthKey(),
      status: "pending"
    };
    const { data: insertedReward, error: rewardError } = await client
      .from("giveaway_rewards")
      .insert(rewardValues)
      .select("*")
      .single();
    if (rewardError) throw rewardError;
    const { error: attachRewardError } = await client.from("giveaway_attempts")
      .update({ reward_id: insertedReward.id })
      .eq("session_id", sessionId);
    if (attachRewardError) throw attachRewardError;
    let reward = selected ? await fulfillReward(insertedReward, account) : insertedReward;
    if (selected && reward.status !== "delivered") {
      reward = await waitForAutomaticDelivery(reward.id) || reward;
    }
    let dmSent = false;
    if (reward.status === "delivered") {
      try {
        await dmWinner(identity, account, reward);
        dmSent = true;
        const sentAt = new Date().toISOString();
        const { data } = await client.from("giveaway_rewards").update({
          dm_status: "sent",
          dm_sent_at: sentAt
        }).eq("id", reward.id).select("*").single();
        reward = data || reward;
      } catch (error) {
        await client.from("giveaway_rewards").update({
          dm_status: "failed",
          fulfillment_error: [reward.fulfillment_error, error.message].filter(Boolean).join(" | ").slice(0, 500)
        }).eq("id", reward.id);
      }
    }
    const winnerEmbed = reward.status === "delivered" ? {
      title: "\u{1F3C6} Verified BTA Mini-Game Winner",
      color: 0xf4b400,
      timestamp: new Date().toISOString(),
      thumbnail: { url: rewardImageUrl(reward) },
      fields: [
        { name: "Winner", value: `<@${identity.id}>`, inline: true },
        { name: "Game", value: config.games[session.gameId].name, inline: true },
        { name: "Prize", value: reward.name, inline: false },
        { name: "Duration", value: reward.duration_days ? `${reward.duration_days} days` : "Permanent/one-time", inline: true },
        { name: "Delivery", value: reward.status, inline: true },
        { name: "Ticket", value: reward.id, inline: false }
      ],
      footer: { text: "BTA verified live reward record" }
    } : null;
    if (winnerEmbed) {
      await Promise.allSettled([
        sendWebhook("winners", winnerEmbed, identity.id),
        sendWebhook("public_winners", winnerEmbed, identity.id)
      ]);
    }
    await audit(identity.id, "reward.awarded", {
      rewardId: reward.id,
      catalogId: reward.reward_id,
      status: reward.status,
      dmSent
    });
    return json({
      session: publicSession(session),
      result: { won: true, message: outcome.message || null, ticket: reward.id },
      reward: {
        id: reward.id,
        name: reward.name,
        type: reward.type,
        quantity: reward.quantity,
        durationDays: reward.duration_days,
        status: reward.status,
        deliveryConfirmed: reward.status === "delivered",
        dmSent
      }
    });
  } catch (error) {
    console.error("[giveaways] move failed", error);
    return json({ error: error.message || "Move could not be recorded." }, error.status || 503);
  }
}

export async function resetAttempts(request) {
  try {
    const identity = await discordIdentity(request);
    if (!(await isGiveawayAdmin(identity.id))) {
      return json({ error: "BTA administrator permission required." }, 403);
    }

    const body = await request.json();
    const scope = body?.scope === "all" ? "all" : "player";
    const targetDiscordId = String(body?.discordId || "").replace(/[<@!>]/g, "");
    if (scope === "player" && !/^\d{17,20}$/.test(targetDiscordId)) {
      return json({ error: "Enter a valid Discord user ID or mention." }, 400);
    }

    const currentPeriod = giveawayPeriod();
    const month = currentPeriod.key;
    const monthStart = currentPeriod.start;
    const nextMonthStart = currentPeriod.end;
    const client = getSupabase();
    let attemptsQuery = client
      .from("giveaway_attempts")
      .select("id", { count: "exact", head: true })
      .eq("attempt_month", month);
    if (scope === "player") attemptsQuery = attemptsQuery.eq("discord_id", targetDiscordId);
    const { count, error: attemptsError } = await attemptsQuery;
    if (attemptsError) throw attemptsError;

    let deleteQuery = client
      .from("giveaway_sessions")
      .delete()
      .gte("started_at", monthStart.toISOString())
      .lt("started_at", nextMonthStart.toISOString());
    if (scope === "player") deleteQuery = deleteQuery.eq("discord_id", targetDiscordId);
    const { error: deleteError } = await deleteQuery;
    if (deleteError) throw deleteError;

    await audit(identity.id, scope === "all" ? "admin.attempts_reset_all" : "admin.attempts_reset_player", {
      targetDiscordId: scope === "player" ? targetDiscordId : null,
      attemptMonth: month,
      attemptsReset: count || 0,
      rewardsPreserved: true
    });
    return json({
      ok: true,
      scope,
      targetDiscordId: scope === "player" ? targetDiscordId : null,
      attemptsReset: count || 0,
      message: scope === "all"
        ? `Reset ${count || 0} current-month attempt(s) for all players. Existing rewards were preserved.`
        : `Reset ${count || 0} current-month attempt(s) for <@${targetDiscordId}>. Existing rewards were preserved.`
    });
  } catch (error) {
    if (!error.status || error.status >= 500) {
      console.error("[giveaways] attempt reset failed", error);
    }
    return json({ error: error.message || "Attempts could not be reset." }, error.status || 503);
  }
}

export async function revokeExpiredKits(request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return json({ error: "Unauthorized." }, 401);
  }
  const client = getSupabase();
  const { data: rewards, error } = await client
    .from("giveaway_rewards")
    .select("*")
    .eq("type", "kit")
    .eq("status", "delivered")
    .lte("expires_at", new Date().toISOString())
    .limit(50);
  if (error) return json({ error: error.message }, 500);
  const results = [];
  for (const reward of rewards || []) {
    try {
      for (const server of reward.fulfillment_servers || []) {
        await rconCommand(server, `oxide.usergroup remove ${reward.steam_id} ${reward.fulfillment_group}`);
        await rconCommand(server, `oxide.group remove ${reward.fulfillment_group}`);
      }
      await client.from("giveaway_rewards").update({ status: "expired" }).eq("id", reward.id);
      results.push({ id: reward.id, status: "expired" });
    } catch (revokeError) {
      await client.from("giveaway_rewards").update({
        fulfillment_error: String(revokeError.message || revokeError).slice(0, 500)
      }).eq("id", reward.id);
      results.push({ id: reward.id, status: "retry" });
    }
  }
  return json({ ok: true, processed: results.length, results });
}

function authorizedRewardWorker(request) {
  const expected = process.env.BTA_GIVEAWAYS_BOT_TOKEN || "";
  const authorization = request.headers.get("authorization") || "";
  const received = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  if (!expected || !received) return false;
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);
  return expectedBuffer.length === receivedBuffer.length &&
    crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

export async function rewardWorker(request) {
  if (!authorizedRewardWorker(request)) return json({ error: "Unauthorized." }, 401);
  try {
    const client = getSupabase();
    const body = await request.json();
    const action = String(body.action || "");
    const id = String(body.id || "");
    if (action === "list") {
      const [{ data: pending, error: pendingError }, { data: deliveredUnsent, error: deliveredError }] =
        await Promise.all([
          client
            .from("giveaway_rewards")
            .select("*")
            .eq("status", "pending")
            .in("type", ["case_keys", "kit"])
            .order("awarded_at", { ascending: true })
            .limit(20),
          client
            .from("giveaway_rewards")
            .select("*")
            .eq("status", "delivered")
            .is("dm_status", null)
            .order("delivered_at", { ascending: true })
            .limit(20)
        ]);
      if (pendingError) throw pendingError;
      if (deliveredError) throw deliveredError;
      return json({ pending: pending || [], deliveredUnsent: deliveredUnsent || [] });
    }
    if (!/^[0-9a-f-]{36}$/i.test(id)) return json({ error: "Valid reward ID required." }, 400);
    if (action === "claim") {
      const { data, error } = await client
        .from("giveaway_rewards")
        .update({ status: "fulfilling", fulfillment_error: null })
        .eq("id", id)
        .eq("status", "pending")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      if (data) await audit(data.discord_id, "reward.delivery_claimed", { rewardId: data.id });
      return json({ reward: data || null });
    }
    if (action === "complete") {
      const now = new Date().toISOString();
      const { data, error } = await client
        .from("giveaway_rewards")
        .update({
          status: "delivered",
          delivered_at: now,
          expires_at: body.expiresAt || null,
          fulfillment_group: body.fulfillmentGroup || null,
          fulfillment_servers: Array.isArray(body.fulfillmentServers) ? body.fulfillmentServers : [],
          fulfillment_error: null,
          dm_status: null,
          dm_sent_at: null
        })
        .eq("id", id)
        .eq("status", "fulfilling")
        .select("*")
        .single();
      if (error) throw error;
      await audit(data.discord_id, "reward.delivery_succeeded", {
        rewardId: data.id,
        servers: data.fulfillment_servers
      });
      return json({ reward: data });
    }
    if (action === "fail") {
      const { data, error } = await client
        .from("giveaway_rewards")
        .update({
          status: "pending",
          fulfillment_error: String(body.error || "Automatic delivery failed.").slice(0, 500)
        })
        .eq("id", id)
        .eq("status", "fulfilling")
        .select("*")
        .single();
      if (error) throw error;
      await audit(data.discord_id, "reward.delivery_retry", {
        rewardId: data.id,
        error: data.fulfillment_error
      });
      return json({ reward: data });
    }
    if (action === "notified") {
      const dmSent = Boolean(body.dmSent);
      const { data, error } = await client
        .from("giveaway_rewards")
        .update({
          dm_status: dmSent ? "sent" : "failed",
          dm_sent_at: dmSent ? new Date().toISOString() : null
        })
        .eq("id", id)
        .eq("status", "delivered")
        .select("*")
        .single();
      if (error) throw error;
      await audit(data.discord_id, "reward.delivery_notified", { rewardId: data.id, dmSent });
      return json({ reward: data });
    }
    return json({ error: "Unknown reward worker action." }, 400);
  } catch (error) {
    console.error("[giveaways] reward worker failed", error);
    return json({ error: error.message || "Reward worker failed." }, 503);
  }
}
