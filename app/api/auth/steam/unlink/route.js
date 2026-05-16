import { NextResponse } from "next/server";

async function logToDiscord() {
  const webhook = process.env.DISCORD_MOD_LOG_WEBHOOK_URL;

  if (!webhook) {
    console.error("[steam] DISCORD_MOD_LOG_WEBHOOK_URL missing");
    return;
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "BTARust Link Logs",
      embeds: [
        {
          title: "Steam Account Unlinked",
          color: 0xef4444,
          description: "A visitor clicked unlink on the website. Local browser link status was cleared.",
          timestamp: new Date().toISOString()
        }
      ]
    })
  });

  if (!res.ok) {
    console.error("[steam] webhook failed", res.status, await res.text());
  }
}

export async function POST() {
  try {
    await logToDiscord();
  } catch (err) {
    console.error("[steam] unlink log failed", err);
  }

  return NextResponse.json({ ok: true });
}
