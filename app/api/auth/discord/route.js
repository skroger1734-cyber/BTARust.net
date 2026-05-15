import { NextResponse } from "next/server";

const DISCORD_CALLBACK_URL = "https://btarust.net/api/auth/discord/callback";

export async function GET() {
  const clientId = process.env.DISCORD_CLIENT_ID || "";

  if (!clientId) {
    return NextResponse.redirect("https://btarust.net/?discord=missing_client_id");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: DISCORD_CALLBACK_URL,
    response_type: "code",
    scope: "identify guilds.join"
  });

  return NextResponse.redirect(`https://discord.com/oauth2/authorize?${params.toString()}`);
}
