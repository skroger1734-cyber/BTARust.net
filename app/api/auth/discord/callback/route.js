import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://btarust.net";
const DISCORD_CALLBACK_URL = "https://btarust.net/api/auth/discord/callback";

async function saveDiscord(user) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key || !user?.id) return;

  const supabase = createClient(url, key);
  const { error } = await supabase.from("linked_accounts").upsert(
    {
      discord_id: user.id,
      discord_username: user.username,
      discord_global_name: user.global_name,
      discord_avatar: user.avatar,
      updated_at: new Date().toISOString()
    },
    { onConflict: "discord_id" }
  );

  if (error) throw error;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let linked = false;

  try {
    if (code && process.env.DISCORD_CLIENT_ID && process.env.DISCORD_CLIENT_SECRET) {
      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.DISCORD_CLIENT_ID,
          client_secret: process.env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code,
          redirect_uri: DISCORD_CALLBACK_URL
        })
      });

      const token = await tokenRes.json();

      if (token.access_token) {
        const userRes = await fetch("https://discord.com/api/users/@me", {
          headers: { Authorization: `Bearer ${token.access_token}` }
        });

        const user = await userRes.json();
        await saveDiscord(user);
        linked = Boolean(user.id);
      }
    }
  } catch (err) {
    console.error("[discord] save/link failed", err);
  }

  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("discord", linked ? "linked" : "failed");
  return NextResponse.redirect(redirect);
}
