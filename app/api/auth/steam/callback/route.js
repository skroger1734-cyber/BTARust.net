import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://btarust.net";

function getSteamId(claimedId) {
  const match = String(claimedId || "").match(/\/(\d+)$/);
  return match?.[1] || null;
}

async function saveSteam(steamId) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || !steamId) return;
  const supabase = createClient(url, key);
  const { error } = await supabase.from("linked_accounts").upsert(
    { steam_id: steamId, updated_at: new Date().toISOString() },
    { onConflict: "steam_id" }
  );
  if (error) throw error;
}

export async function GET(request) {
  const url = new URL(request.url);
  const steamId = getSteamId(url.searchParams.get("openid.claimed_id"));
  try { if (steamId) await saveSteam(steamId); } catch (err) { console.error("[steam] Supabase save skipped/failed", err); }
  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("steam", steamId ? "linked" : "failed");
  return NextResponse.redirect(redirect);
}
