import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SITE_URL = "https://btarust.net";
const DISCORD_CALLBACK_URL = "https://btarust.net/api/auth/discord/callback";

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

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
      discord_avatar: discordAvatarUrl(user),
      updated_at: new Date().toISOString()
    },
    { onConflict: "discord_id" }
  );

  if (error) throw error;
}

async function assignVerifiedRole(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;
  if (!token || !guildId || !roleId || !discordId) return;

  await fetch(`https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`, {
    method: "PUT",
    headers: { Authorization: `Bot ${token}` }
  });
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  let linked = false;
  let user = null;

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

        user = await userRes.json();
        await saveDiscord(user);
        await assignVerifiedRole(user.id);
        linked = Boolean(user.id);
      }
    }
  } catch (err) {
    console.error("[discord] save/link failed", err);
  }

  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("discord", linked ? "linked" : "failed");

  if (linked && user) {
    redirect.searchParams.set("discord_name", user.global_name || user.username || "Discord User");
    redirect.searchParams.set("discord_avatar", discordAvatarUrl(user));
  }

  return NextResponse.redirect(redirect);
}
