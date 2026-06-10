import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Rcon } from "rcon-client";
import { sendDiscordLog } from "../../_utils/discordLog";

export const runtime = "nodejs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.btarust.net";
const DISCORD_CALLBACK_URL = `${SITE_URL}/api/auth/discord/callback`;
const LINK_COOKIE = "btarust_link_key";

function getOrCreateLinkKey(request) {
  return request.cookies.get(LINK_COOKIE)?.value || crypto.randomUUID();
}

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

function redirectHome(status, user = null, linkKey = null) {
  const redirect = new URL("/", SITE_URL);
  redirect.searchParams.set("discord", status);

  if (status === "linked" && user?.id) {
    redirect.searchParams.set(
      "discord_name",
      user.global_name || user.username || "Discord User"
    );
    redirect.searchParams.set("discord_avatar", discordAvatarUrl(user));
  }

  const response = NextResponse.redirect(redirect);

  if (linkKey) {
    response.cookies.set(LINK_COOKIE, linkKey, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30
    });
  }

  return response;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase env vars");
  }

  return createClient(url, key);
}

async function assignVerifiedRole(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;
  const roleId = process.env.DISCORD_VERIFIED_ROLE_ID;

  if (!token || !guildId || !roleId || !discordId) {
    console.error("[discord] Missing role env vars");
    return false;
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}/roles/${roleId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${token}`
      }
    }
  );

  if (!res.ok) {
    console.error("[discord] verified role failed", res.status, await res.text());
    return false;
  }

  return true;
}

async function getDiscordMember(discordId) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guildId = process.env.DISCORD_GUILD_ID;

  if (!token || !guildId || !discordId) {
    console.error("[discord] Missing member lookup env vars");
    return null;
  }

  const res = await fetch(
    `https://discord.com/api/v10/guilds/${guildId}/members/${discordId}`,
    {
      headers: {
        Authorization: `Bot ${token}`
      }
    }
  );

  if (!res.ok) {
    console.error("[discord] member lookup failed", res.status, await res.text());
    return null;
  }

  return await res.json();
}

async function sendRconCommand(command) {
  const host = process.env.RUST_SERVER_IP;
  const port = Number(process.env.RUST_RCON_PORT);
  const password = process.env.RUST_RCON_PASSWORD;

  if (!host || !port || !password) {
    console.error("[rcon] Missing RCON env vars");
    return false;
  }

  let rcon = null;

  try {
    rcon = await Rcon.connect({ host, port, password });
    const result = await rcon.send(command);
    console.log("[rcon]", command, result);
    return true;
  } catch (err) {
    console.error("[rcon] command failed", command, err);
    return false;
  } finally {
    if (rcon) rcon.end();
  }
}

async function saveDiscord(user, linkKey) {
  if (!user?.id || !linkKey) {
    throw new Error("Missing Discord user or link key");
  }

  const supabase = getSupabase();

  const { error } = await supabase.from("linked_accounts").upsert(
    {
      link_key: linkKey,
      discord_id: user.id,
      discord_username: user.username || null,
      discord_global_name: user.global_name || null,
      discord_avatar: discordAvatarUrl(user),
      updated_at: new Date().toISOString()
    },
    {
      onConflict: "link_key"
    }
  );

  if (error) throw error;
}

async function syncRustGroups(linkKey) {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("linked_accounts")
    .select("discord_id, steam_id")
    .eq("link_key", linkKey)
    .maybeSingle();

  if (error) {
    console.error("[sync] lookup failed", error);
    return false;
  }

  if (!data?.discord_id || !data?.steam_id) {
    console.log("[sync] Steam and Discord are not both linked yet", data);
    return false;
  }

  await assignVerifiedRole(data.discord_id);

  const member = await getDiscordMember(data.discord_id);
  const roles = Array.isArray(member?.roles) ? member.roles : [];
  const boosterRoleId = process.env.DISCORD_BOOSTER_ROLE_ID;

  const rustGroup =
    boosterRoleId && roles.includes(boosterRoleId)
      ? "discordbooster"
      : "discord";

  await sendRconCommand(`oxide.usergroup add ${data.steam_id} ${rustGroup}`);
  await sendRconCommand("server.writecfg");

  return true;
}

async function exchangeCodeForToken(code) {
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: DISCORD_CALLBACK_URL
    })
  });

  const token = await tokenRes.json();

  if (!tokenRes.ok || !token.access_token) {
    console.error("[discord] token failed", tokenRes.status, token);
    return null;
  }

  return token;
}

async function getDiscordUser(accessToken) {
  const userRes = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  const user = await userRes.json();

  if (!userRes.ok || !user?.id) {
    console.error("[discord] user lookup failed", userRes.status, user);
    return null;
  }

  return user;
}

export async function GET(request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");
  const linkKey = getOrCreateLinkKey(request);

  if (error) {
    console.error("[discord] oauth returned error", error);
    return redirectHome("failed", null, linkKey);
  }

  if (!code) {
    console.error("[discord] missing code");
    return redirectHome("failed", null, linkKey);
  }

  if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.error("[discord] missing Discord client env vars");
    return redirectHome("failed", null, linkKey);
  }

  try {
    const token = await exchangeCodeForToken(code);

    if (!token?.access_token) {
      return redirectHome("failed", null, linkKey);
    }

    const user = await getDiscordUser(token.access_token);

    if (!user?.id) {
      return redirectHome("failed", null, linkKey);
    }

    await saveDiscord(user, linkKey);
    await syncRustGroups(linkKey);

    await sendDiscordLog({
      title: "Discord Account Linked",
      color: 0x5865f2,
      thumbnail: {
        url: discordAvatarUrl(user)
      },
      fields: [
        {
          name: "Discord Name",
          value: user.global_name || user.username || "Unknown",
          inline: true
        },
        {
          name: "Discord Username",
          value: user.username || "Unknown",
          inline: true
        },
        {
          name: "Discord ID",
          value: user.id || "Unknown",
          inline: false
        }
      ],
      timestamp: new Date().toISOString()
    });

    return redirectHome("linked", user, linkKey);
  } catch (err) {
    console.error("[discord] link failed", err);
    return redirectHome("failed", null, linkKey);
  }
}
