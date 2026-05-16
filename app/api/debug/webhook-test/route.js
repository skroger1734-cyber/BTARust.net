import { NextResponse } from "next/server";
import { sendDiscordLog } from "../../auth/_utils/discordLog";

export async function GET(request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!process.env.JWT_SECRET || key !== process.env.JWT_SECRET) {
    return NextResponse.json({ ok: false, error: "Unauthorized. Add ?key=YOUR_JWT_SECRET" }, { status: 401 });
  }

  const result = await sendDiscordLog({
    title: "BTARust Webhook Test",
    color: 0xf97316,
    description: "If you see this in Discord, DISCORD_MOD_LOG_WEBHOOK_URL is working.",
    timestamp: new Date().toISOString()
  });

  return NextResponse.json(result);
}
