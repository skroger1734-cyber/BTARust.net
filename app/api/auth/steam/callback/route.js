import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDiscordLog } from "../../_utils/discordLog";

const SITE_URL = "https://btarust.net";

function getSteamId(claimedId) {
  const match = String(claimedId || "").match(/\/(\d+)$/);
  return match?.[1] || null;
}

async function getSteamProfile(steamId) {
  const key = process.env.STEAM_API_KEY;
  if (!key || !steamId) {
    console.error("[steam] STEAM_API_KEY missing or no Steam ID");
    return null;
  }

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

async function saveSteam(steamId, profile) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !steamId) {
    console.error("[steam] Missing Supabase env vars or Steam ID");
    return;
  }

  const supabase = createClient(url, key);
  const { error } = await supabase.from("linked_accounts").upsert(
    {
      steam_id: steamId,
      steam_persona: profile?.personaname || null,
      steam_avatar: profile?.avatarfull || profile?.avatarmedium || profile?.avatar || null,
      updated_at: new Date().toISOString()
    },
    { onConflict: "steam_id" }
  );

  if (error) throw error;
}

export async function GET(request) {
  const url = new URL(request.url);
  const steamId = getSteamId(url.searchParams.get("openid.claimed_id"));
  let profile = null;

  try {
    if (steamId) {
      profile = await getSteamProfile(steamId);
      await saveSteam(steamId, profile);
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
      console.log("[steam] linked", { steamId, persona: profile?.personaname || null });
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

  return NextResponse.redirect(redirect);
}
