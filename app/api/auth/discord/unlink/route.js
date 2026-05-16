import { NextResponse } from "next/server";
import { sendDiscordLog } from "../../_utils/discordLog";

export async function POST() {
  try {
    await sendDiscordLog({
      title: "Discord Account Unlinked",
      color: 0xef4444,
      description: "A visitor clicked unlink on the website. Local browser link status was cleared.",
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("[discord] unlink log failed", err);
  }

  return NextResponse.json({ ok: true });
}
