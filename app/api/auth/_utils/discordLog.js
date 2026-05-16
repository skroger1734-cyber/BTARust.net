export async function sendDiscordLog(embed) {
  const webhook = process.env.DISCORD_MOD_LOG_WEBHOOK_URL;

  if (!webhook) {
    console.error("[webhook] DISCORD_MOD_LOG_WEBHOOK_URL missing");
    return { ok: false, status: 0, message: "missing webhook env" };
  }

  const res = await fetch(webhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: "BTARust Link Logs",
      embeds: [embed]
    })
  });

  const text = await res.text().catch(() => "");

  if (!res.ok) {
    console.error("[webhook] failed", res.status, text);
    return { ok: false, status: res.status, message: text };
  }

  console.log("[webhook] sent", embed?.title || "log");
  return { ok: true, status: res.status, message: text };
}
