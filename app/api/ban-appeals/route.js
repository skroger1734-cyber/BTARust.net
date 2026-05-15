import { NextResponse } from "next/server";
export async function POST() { return NextResponse.json({ ok: true, message: "Submit ban appeals through Discord support tickets." }); }
