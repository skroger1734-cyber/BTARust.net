import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDiscordLog } from "../../_utils/discordLog";

const SITE_URL = "https://btarust.net";
const LINK_COOKIE = "btarust_link_key";

function getOrCreateLinkKey(request) {
  return request.cookies.get(LINK_COOKIE)?.value || crypto.randomUUID();
}

function getSteamId(claimedId) {
  const match = String(claimedId || "").match(/\/(\d+)$/);
  return match?.[1] || null;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function getSteamProfile(steamId) {
  const key = process.env.STEAM_API_KEY;
  if (!key || !steamId) return null;

  const res = await fetch(
    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamId}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    console.error("[steam] profile fetch failed", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  return data?.response?.players?.[0] || null;
}

async function assignVerifiedRole(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;

  if (!token || !guildId || !roleId || !discordId) return false;

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: { Authorization: `Bot ${token}` }
    }
  );

  if (!res.ok) {
    console.error("[discord] verified role failed", res.status, await res.text());
    return false;
  }

  console.log("[discord] verified role assigned", discordId);
  return true;
}

async function maybeAssignVerifiedRole(linkKey) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("linked_accounts")
    .select("discord_id, steam_id")
    .eq("link_key", linkKey)
    .maybeSingle();

  if (error) {
    console.error("[verify] lookup failed", error);
    return false;
  }

  if (!data?.discord_id || !data?.steam_id) {
    console.log("[verify] not ready yet", data);
    return false;
  }

  return await assignVerifiedRole(data.discord_id);
}

async function saveSteam(steamId, profile, linkKey) {
  if (!steamId || !linkKey) throw new Error("Missing Steam ID or link key");

  const supabase = getSupabase();

  const { error } = await supabase.from("linked_accounts").upsert(
    {
      link_key: linkKey,
      steam_id: steamId,
      steam_persona: profile?.personaname || null,
      steam_avatar: profile?.avatarfull || profile?.avatarmedium || profile?.avatar || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "link_key" }
  );

  if (error) throw error;
}

export async function GET(request) {
  const url = new URL(request.url);
  const steamId = getSteamId(url.searchParams.get("openid.claimed_id"));
  const linkKey = getOrCreateLinkKey(request);

  let profile = null;

  try {
    if (steamId) {
      profile = await getSteamProfile(steamId);
      await saveSteam(steamId, profile, linkKey);
      await maybeAssignVerifiedRole(linkKey);

      await sendDiscordLog({
        title: "Steam Account Linked",
        color: 0x22c55e,
        thumbnail: { url: profile?.avatarfull || profile?.avatarmedium || profile?.avatar || undefined },
        fields: [
          { name: "Steam Name", value: profile?.personaname || "Unknown", inline: true },
          { name: "Steam ID", value: steamId || "Unknown", inline: true }
        ],
        timestamp: new Date().toISOString()
      });
    }
  } catch (err) {
    console.error("[steam] link failed", err);
  }

  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("steam", steamId ? "linked" : "failed");

  if (profile?.personaname) redirect.searchParams.set("steam_name", profile.personaname);
  if (profile?.avatarfull || profile?.avatarmedium || profile?.avatar) {
    redirect.searchParams.set("steam_avatar", profile.avatarfull || profile.avatarmedium || profile.avatar);
  }

  const response = NextResponse.redirect(redirect);
  response.cookies.set(LINK_COOKIE, linkKey, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });

  return response;
}
