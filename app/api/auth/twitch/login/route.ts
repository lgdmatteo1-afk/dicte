import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function randomState() {
  return crypto.randomUUID();
}

export async function GET(req: Request) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const redirectUri = process.env.TWITCH_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return new NextResponse("Missing TWITCH env vars", { status: 500 });
  }

  const url = new URL(req.url);

  // ✅ next = où on doit revenir après login
  // ex: /play/xxxxx
  const next = url.searchParams.get("next") || "/";

  const nonce = randomState();
  const statePayload = { n: nonce, next };
  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  const jar = await cookies();
  jar.set("twitch_state", nonce, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 10,
  });

  const auth = new URL("https://id.twitch.tv/oauth2/authorize");
  auth.searchParams.set("client_id", clientId);
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("scope", "user:read:email");
  auth.searchParams.set("state", state);

  return NextResponse.redirect(auth.toString());
}
