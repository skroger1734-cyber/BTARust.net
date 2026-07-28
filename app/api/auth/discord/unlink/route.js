import { NextResponse } from "next/server";
import { sendDiscordLog } from "../../_utils/discordLog";
import { LINK_COOKIE, getLinkedAccount, getSupabase } from "../../_utils/linking";

export async function POST(request) {
  const linkKey = request.cookies.get(LINK_COOKIE)?.value;

  if (!linkKey) {
    return NextResponse.json({ ok: false, error: "No linked account session" }, { status: 400 });
  }

  try {
    const account = await getLinkedAccount(linkKey);
    const { error } = await getSupabase()
      .from("linked_accounts")
      .update({
        discord_id: null,
        discord_username: null,
        discord_global_name: null,
        discord_avatar: null,
        updated_at: new Date().toISOString()
      })
      .eq("link_key", linkKey);

    if (error) throw error;

    const logResult = await sendDiscordLog({
      title: "Discord Account Unlinked",
      color: 0xef4444,
      fields: [
        { name: "Discord Name", value: account?.discord_global_name || account?.discord_username || "Unknown", inline: true },
        { name: "Discord ID", value: account?.discord_id || "Unknown", inline: true },
        { name: "Steam ID", value: account?.steam_id || "Not linked", inline: false }
      ],
      timestamp: new Date().toISOString()
    });

    if (!logResult.ok) throw new Error(`Discord audit log failed (${logResult.status})`);
  } catch (err) {
    console.error("[discord] unlink failed", err);
    return NextResponse.json({ ok: false, error: "Unable to unlink Discord" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
