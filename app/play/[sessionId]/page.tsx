"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type TwitchUser = {
  id: string;
  login: string;
  name: string;
  avatar: string;
};

export default function PlayPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [me, setMe] = useState<TwitchUser | null>(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [texte, setTexte] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function loadMe() {
    setLoadingMe(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const json = await res.json();
      setMe(json);
    } catch {
      setMe(null);
    } finally {
      setLoadingMe(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function submit() {
    if (!sessionId) return alert("Session invalide.");
    if (!me) return alert("Connecte-toi avec Twitch avant d’envoyer 🙂");
    if (!texte.trim()) return alert("Écris la dictée avant d’envoyer 🙂");

    setLoading(true);
    const res = await fetch("/api/submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        pseudo: me.login,
        texte,
        twitch: me, // ✅ IMPORTANT : envoie id/login/name/avatar pour la page host
      }),
    });
    setLoading(false);

    if (!res.ok) {
      const t = await res.text();
      alert("Erreur: " + t);
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <main className="container">
        <div className="card" style={{ textAlign: "center", padding: 28 }}>
          <span className="badge">✅ Envoyé</span>
          <h1 className="h1" style={{ fontSize: 28, marginTop: 10 }}>
            Merci !
          </h1>
          <p className="sub">Ta dictée a été envoyée au streamer.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div>
          <h1 className="h1" style={{ fontSize: 30 }}>
            Écris la dictée
          </h1>
          <p className="sub">Connexion Twitch + texte, puis “Soumettre”.</p>
        </div>
        <span className="badge badgeRed">🟥 Live</span>
      </div>

      <div style={{ height: 14 }} />

      <div className="card">
        {/* Auth block */}
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div>
            <div style={{ fontWeight: 900 }}>Compte Twitch</div>
            <div className="sub" style={{ marginTop: 2 }}>
              Nécessaire pour envoyer la dictée.
            </div>
          </div>

          {loadingMe ? (
            <span className="badge">⏳ Vérification…</span>
          ) : !me ? (
           <a
  className="btn"
  href={`${window.location.origin}/api/auth/twitch/login?next=/play/${sessionId}`}
>
              Se connecter avec Twitch
            </a>
          ) : (
            <div className="row">
              <img
                src={me.avatar}
                alt={me.login}
                width={34}
                height={34}
                style={{
                  borderRadius: 999,
                  border: "1px solid rgba(15,23,42,.15)",
                }}
              />
              <div style={{ fontWeight: 900 }}>@{me.login}</div>
              <a
  className="btn btnGhost"
  href={`${window.location.origin}/api/auth/logout?next=/play/${sessionId}`}
>
  Déconnexion
</a>

            </div>
          )}
        </div>

        <div className="divider" />

        {/* Text */}
        <textarea
          className="textarea"
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="Écris ici pendant que le streamer dicte…"
          disabled={!me && !loadingMe}
        />

        <div style={{ height: 12 }} />

        <div className="row" style={{ justifyContent: "space-between" }}>
          <span className="sub">Astuce : relis vite avant d’envoyer 😉</span>

          <button
            className="btn btnRed"
            onClick={submit}
            disabled={loading || loadingMe || !me}
            title={!me ? "Connecte-toi avec Twitch" : ""}
          >
            {loading ? "Envoi..." : "Soumettre"}
          </button>
        </div>

        {!loadingMe && !me && (
          <div style={{ marginTop: 10 }} className="sub">
            🔒 Tu dois être connecté Twitch pour envoyer.
          </div>
        )}
      </div>
    </main>
  );
}
