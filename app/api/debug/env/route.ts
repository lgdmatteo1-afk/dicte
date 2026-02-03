import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return NextResponse.json({
    origin: new URL(req.url).origin,
    TWITCH_CLIENT_ID: process.env.TWITCH_CLIENT_ID ? "OK" : "MISSING",
    TWITCH_CLIENT_SECRET: process.env.TWITCH_CLIENT_SECRET ? "OK" : "MISSING",
    TWITCH_REDIRECT_URI: process.env.TWITCH_REDIRECT_URI || "MISSING",
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
  });
}
