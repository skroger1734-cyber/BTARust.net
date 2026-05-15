import { NextResponse } from "next/server";
export async function GET() { return NextResponse.json({ enabled: Boolean(process.env.BATTLEMETRICS_API_KEY), serverId: process.env.BATTLEMETRICS_SERVER_ID || null }); }
