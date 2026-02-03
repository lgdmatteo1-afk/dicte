import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new NextResponse("Missing TWITCH env vars", { status: 500 });
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code) return NextResponse.redirect("/");

  // ✅ redirect_uri identique à l'authorize
const redirectUri = process.env.TWITCH_REDIRECT_URI;  
if (!redirectUri) {
  return new NextResponse("Missing TWITCH_REDIRECT_URI", { status: 500 });
}


  // ✅ decode state to get next path
  let nextPath = "/";
  let nonceFromState: string | null = null;

  try {
    if (state) {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8")
      );
      nextPath = typeof decoded?.next === "string" ? decoded.next : "/";
      nonceFromState = typeof decoded?.n === "string" ? decoded.n : null;
    }
  } catch {}

  // ✅ state check
  const jar = await cookies();
  const expectedNonce = jar.get("twitch_state")?.value;

  if (expectedNonce && nonceFromState && expectedNonce !== nonceFromState) {
    return new NextResponse("Invalid state", { status: 400 });
  }

  const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  const tokenText = await tokenRes.text();
  if (!tokenRes.ok) {
    return new NextResponse("Token error: " + tokenText, { status: 500 });
  }
  const token = JSON.parse(tokenText);

  const userRes = await fetch("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      "Client-Id": clientId,
    },
  });

  const userText = await userRes.text();
  if (!userRes.ok) {
    return new NextResponse("User error: " + userText, { status: 500 });
  }

  const data = JSON.parse(userText);
  const user = data?.data?.[0];
  if (!user) return new NextResponse("No user returned", { status: 500 });

  jar.set(
    "twitch_user",
    JSON.stringify({
      id: user.id,
      login: user.login,
      name: user.display_name,
      avatar: user.profile_image_url,
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }
  );

  // clean state
  jar.set("twitch_state", "", { path: "/", maxAge: 0 });

  // ✅ IMPORTANT: go back where we came from
  // sécurité: on n'autorise que les chemins internes
  if (!nextPath || nextPath.includes("://") || !nextPath.startsWith("/")) {
  nextPath = "/";
}
const baseUrl = process.env.APP_URL || url.origin;
return NextResponse.redirect(baseUrl + nextPath);


}
