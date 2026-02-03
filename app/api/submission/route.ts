import { diffWords } from "@/lib/diff";
import { readSessions, writeSessions } from "@/lib/persist";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type TwitchPayload = {
  id?: string;
  login?: string;
  name?: string;
  avatar?: string;
};

export async function POST(req: Request) {
  const body = await req.json();

  const sessionId: string = body?.sessionId;
  const texte: string = body?.texte ?? "";
  const pseudo: string = body?.pseudo ?? "";
  const twitch: TwitchPayload | undefined = body?.twitch;

  if (!sessionId) return new Response("sessionId manquant", { status: 400 });
  if (!texte.trim()) return new Response("texte manquant", { status: 400 });

  const sessions = readSessions();

  if (!sessions[sessionId]) {
    return new Response("Session inconnue", { status: 404 });
  }

  const ref = sessions[sessionId].texteReference || "";
  const diff = diffWords(ref, texte);

  const erreurs = diff.reduce((acc: number, t: any) => (t.type === "ok" ? acc : acc + 1), 0);
  const score = Math.max(0, 1000 - erreurs * 10);

  // ✅ pseudo final : priorité au login twitch si fourni
  const finalPseudo = (twitch?.login || pseudo || "").trim();
  if (!finalPseudo) return new Response("pseudo manquant", { status: 400 });

  sessions[sessionId].submissions.push({
    // identités
    pseudo: finalPseudo,                 // @login twitch (ou ancien pseudo)
    twitchId: twitch?.id || null,
    displayName: twitch?.name || null,
    avatar: twitch?.avatar || null,

    // contenu
    texte,
    score,
    erreurs,
    diff,
    createdAt: Date.now(),
  });

  writeSessions(sessions);

  return Response.json({ success: true });
}
