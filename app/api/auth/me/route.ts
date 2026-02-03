import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const jar = await cookies();
  const c = jar.get("twitch_user")?.value;

  return NextResponse.json(c ? JSON.parse(c) : null);
}
