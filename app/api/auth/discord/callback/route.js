import { NextResponse } from "next/server";
import { sendDiscordLog } from "../../_utils/discordLog";
import { syncLinkedIdentityByKey } from "../../../_utils/entitlements";
import {
  DISCORD_STATE_COOKIE,
  LINK_COOKIE,
  SITE_URL,
  getOrCreateLinkKey,
  linkCookieOptions,
  saveLinkedIdentity
} from "../../_utils/linking";

export const runtime = "nodejs";

const DISCORD_CALLBACK_URL = `${SITE_URL}/api/auth/discord/callback`;

function discordAvatarUrl(user) {
  if (!user?.id || !user?.avatar) {
    return "https://cdn.discordapp.com/embed/avatars/0.png";
  }

  const ext = user.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}?size=128`;
}

function redirectHome(status, user = null, linkKey = null) {
  const redirect = new URL("/account-linking", SITE_URL);
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
    response.cookies.set(LINK_COOKIE, linkKey, linkCookieOptions());
  }

  response.cookies.delete(DISCORD_STATE_COOKIE);
  return response;
}

async function saveDiscord(user, linkKey) {
  if (!user?.id || !linkKey) {
    throw new Error("Missing Discord user or link key");
  }

  await saveLinkedIdentity({
    linkKey,
    identityColumn: "discord_id",
    identityValue: user.id,
    values: {
      discord_id: user.id,
      discord_username: user.username || null,
      discord_global_name: user.global_name || null,
      discord_avatar: discordAvatarUrl(user)
    }
  });
}

async function syncRustGroups(linkKey) {
  const result = await syncLinkedIdentityByKey(linkKey);
  if (!result.linked) {
    console.log("[sync] Steam and Discord are not both linked yet");
    return false;
  }

  // The existing ServerPanel LinkBot watches the shared linked_accounts table
  // and applies ServerPanel's normal link command to US, EU, and Test.
  return true;
}

async function exchangeCodeForToken(code) {
  const clientId = process.env.DISCORD_CLIENT_ID || process.env.BTA_DISCORD_CLIENT_ID;
  const clientSecret =
    process.env.DISCORD_CLIENT_SECRET || process.env.BTA_DISCORD_CLIENT_SECRET;
  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
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
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(DISCORD_STATE_COOKIE)?.value;
  const linkKey = getOrCreateLinkKey(request);

  if (!state || !expectedState || state !== expectedState) {
    console.error("[discord] invalid oauth state");
    return redirectHome("failed", null, linkKey);
  }

  if (error) {
    console.error("[discord] oauth returned error", error);
    return redirectHome("failed", null, linkKey);
  }

  if (!code) {
    console.error("[discord] missing code");
    return redirectHome("failed", null, linkKey);
  }

  if (
    !(process.env.DISCORD_CLIENT_ID || process.env.BTA_DISCORD_CLIENT_ID) ||
    !(process.env.DISCORD_CLIENT_SECRET || process.env.BTA_DISCORD_CLIENT_SECRET)
  ) {
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

    const logResult = await sendDiscordLog({
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

    if (!logResult.ok) {
      console.error("[discord] link saved but audit log failed", logResult.status);
    }

    return redirectHome("linked", user, linkKey);
  } catch (err) {
    console.error("[discord] link failed", err);
    return redirectHome("failed", null, linkKey);
  }
}
