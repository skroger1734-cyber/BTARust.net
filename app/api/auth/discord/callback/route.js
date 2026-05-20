import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendDiscordLog } from "../../_utils/discordLog";

const SITE_URL = "https://btarust.net";
const DISCORD_CALLBACK_URL = "https://btarust.net/api/auth/discord/callback";
const LINK_COOKIE = "btarust_link_key";

function getOrCreateLinkKey(request) {
  return request.cookies.get(LINK_COOKIE)?.value || crypto.randomUUID();
}

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) return "https://cdn.discordapp.com/embed/avatars/0.png";
  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars");
  return createClient(url, key);
}

async function assignVerifiedRole(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;

  if (!token || !guildId || !roleId || !discordId) {
    console.error("[discord] Missing role assignment env vars");
    return false;
  }

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

async function saveDiscord(user, linkKey) {
  if (!user?.id || !linkKey) throw new Error("Missing Discord user or link key");

  const supabase = getSupabase();

  const { error } = await supabase.from("linked_accounts").upsert(
    {
      link_key: linkKey,
      discord_id: user.id,
      discord_username: user.username,
      discord_global_name: user.global_name,
      discord_avatar: discordAvatarUrl(user),
      updated_at: new Date().toISOString()
    },
    { onConflict: "link_key" }
  );

  if (error) throw error;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const linkKey = getOrCreateLinkKey(request);

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

        await saveDiscord(user, linkKey);
        await maybeAssignVerifiedRole(linkKey);

        await sendDiscordLog({
          title: "Discord Account Linked",
          color: 0x5865f2,
          thumbnail: { url: discordAvatarUrl(user) },
          fields: [
            { name: "Discord Name", value: user.global_name || user.username || "Unknown", inline: true },
            { name: "Discord Username", value: user.username || "Unknown", inline: true },
            { name: "Discord ID", value: user.id || "Unknown", inline: false }
          ],
          timestamp: new Date().toISOString()
        });

        linked = Boolean(user.id);
      } else {
        console.error("[discord] token failed", token);
      }
    }
  } catch (err) {
    console.error("[discord] link failed", err);
  }

  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("discord", linked ? "linked" : "failed");

  if (linked && user) {
    redirect.searchParams.set("discord_name", user.global_name || user.username || "Discord User");
    redirect.searchParams.set("discord_avatar", discordAvatarUrl(user));
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
