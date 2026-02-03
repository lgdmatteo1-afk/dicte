import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  let nextPath = url.searchParams.get("next") || "/";

  // sécurité: on autorise uniquement les chemins internes
  if (!nextPath.startsWith("/")) nextPath = "/";

  const jar = await cookies();
  jar.set("twitch_user", "", { path: "/", maxAge: 0 });

const baseUrl = process.env.APP_URL || url.origin;
return NextResponse.redirect(baseUrl + nextPath);
}
