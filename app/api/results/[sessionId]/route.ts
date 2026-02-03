export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { readSessions } from "@/lib/persist";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  const { sessionId } = await params;

  const sessions = readSessions();
  const session = sessions[sessionId];

  const rows = session.submissions;

  rows.sort((a: any, b: any) => {
    if ((a.erreurs ?? 999999) !== (b.erreurs ?? 999999)) {
      return (a.erreurs ?? 999999) - (b.erreurs ?? 999999);
    }
    if ((a.score ?? 0) !== (b.score ?? 0)) {
      return (b.score ?? 0) - (a.score ?? 0);
    }
    return (a.createdAt ?? 0) - (b.createdAt ?? 0);
  });

  return Response.json(rows);
}
