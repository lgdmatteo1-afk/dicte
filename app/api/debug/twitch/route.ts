import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    TWITCH_CLIENT_ID: !!process.env.TWITCH_CLIENT_ID,
    TWITCH_CLIENT_SECRET: !!process.env.TWITCH_CLIENT_SECRET,
    TWITCH_REDIRECT_URI: process.env.TWITCH_REDIRECT_URI || null,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || null,
    VERCEL_URL: process.env.VERCEL_URL || null,
    RAILWAY_PUBLIC_DOMAIN: process.env.RAILWAY_PUBLIC_DOMAIN || null,
  });
}
