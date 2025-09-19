import { useEffect, useMemo, useState } from "react";

const ADMIN_API = import.meta.env.VITE_ADMIN_API_URL;
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN;
const ANON_KEY    = import.meta.env.VITE_SUPABASE_ANON_KEY;

type Item = { id:string; spotify_id:string; name:string; artist_name:string; decided_at:string|null; rules_fired:any[]|null; };

export default function PatouAdmin() {
  const [status, setStatus] = useState<"allowed"|"blocked">("allowed");
  const [q, setQ] = useState(""); const [page, setPage] = useState(1);
  const pageSize = 50;

  const url = useMemo(() => {
    const u = new URL(ADMIN_API);
    u.searchParams.set("status", status);
    if (q.trim()) u.searchParams.set("q", q.trim());
    u.searchParams.set("page", String(page));
    u.searchParams.set("pageSize", String(pageSize));
    return u.toString();
  }, [status, q, page]);

  const [data, setData] = useState<{items:Item[]; total:number} | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string|null>(null);

  async function load() {
    setLoading(true); setErr(null);
    try {
      const r = await fetch(url, {
        headers: {
          "x-admin-token": ADMIN_TOKEN, // ✅ seul header
        }
      });
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
      const j = await r.json(); setData({ items: j.items, total: j.total });
    } catch(e:any){ setErr(e.message||String(e)); } finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-line */ }, [url]);

  return (
    <main style={{ padding:24 }}>
      <div style={{ padding:16, border:"1px solid #e5e7eb", borderRadius:12, background:"#fff" }}>
        <h1 style={{ fontSize:24, fontWeight:800 }}>✅ PATOU ADMIN — /patou-admin</h1>
        <p style={{ color:"#6b7280" }}>Autorisées / Rejetées + recherche</p>
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:16 }}>
        <div style={{ display:"inline-flex", border:"1px solid #e5e7eb", borderRadius:8, overflow:"hidden" }}>
          <button onClick={()=>{setStatus("allowed"); setPage(1);}} style={{ padding:"8px 16px", background: status==="allowed"?"#fff":"#f3f4f6" }}>Autorisées</button>
          <button onClick={()=>{setStatus("blocked"); setPage(1);}} style={{ padding:"8px 16px", background: status==="blocked"?"#fff":"#f3f4f6" }}>Rejetées</button>
        </div>
        <input placeholder="Rechercher (titre ou artiste)…" value={q}
          onChange={(e)=>{ setQ(e.target.value); setPage(1); }}
          style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, width:320 }} />
        <button onClick={load} style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}>Rafraîchir</button>
      </div>

      <div style={{ display:"flex", gap:8, marginTop:16 }}>
        <button
          onClick={async () => {
            try {
              const ADMIN = import.meta.env.VITE_ADMIN_TOKEN || "";
              console.log("FRONT DIAG", { lenAdminFront: ADMIN.length });

              const r = await fetch(
                "https://umqzlqrgpxbdrnrmvjpe.functions.supabase.co/spotify-auth-start",
                {
                  headers: {
                    "x-admin-token": ADMIN,               // 1) notre header custom
                    "Authorization": `Bearer ${ADMIN}`,    // 2) fallback si jamais x- est filtré
                  },
                }
              );
              const j = await r.json().catch(() => ({}));
              if (!r.ok) {
                alert(`auth-start ${r.status}: ${JSON.stringify(j)}`);
                return;
              }
              if (j.authorize_url) {
                window.location.href = j.authorize_url;
              } else {
                alert("auth-start: réponse inattendue " + JSON.stringify(j));
              }
            } catch (e:any) {
              alert("auth-start: " + (e.message || String(e)));
            }
          }}
          style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
        >
          Connecter Spotify (1er setup)
        </button>

        <button
          onClick={async () => {
            const r = await fetch("https://umqzlqrgpxbdrnrmvjpe.functions.supabase.co/publish-weekly-playlists", {
              method: "POST",
              headers: {
                "x-admin-token": ADMIN_TOKEN, // ✅ seul header
              }
            });
            const j = await r.json();
            alert(j.ok ? "Playlists publiées ✅" : "Erreur publish: " + JSON.stringify(j));
          }}
          style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
        >Publier les 3 playlists</button>
      </div>

      {loading && <div style={{ marginTop:12 }}>Chargement…</div>}
      {err && <div style={{ color:"red", marginTop:12 }}>Erreur: {err}</div>}

      <div style={{ overflowX:"auto", border:"1px solid #e5e7eb", borderRadius:12, marginTop:16, background:"#fff" }}>
        <table style={{ width:"100%", fontSize:14 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #e5e7eb", background:"#f9fafb" }}>
              <th style={{ textAlign:"left", padding:"8px 12px" }}>Titre</th>
              <th style={{ textAlign:"left", padding:"8px 12px" }}>Artiste</th>
              <th style={{ textAlign:"left", padding:"8px 12px" }}>Raisons</th>
              <th style={{ textAlign:"left", padding:"8px 12px" }}>Décision le</th>
              <th style={{ textAlign:"left", padding:"8px 12px" }}>Spotify</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((row) => (
              <tr key={row.id} style={{ borderBottom:"1px solid #f3f4f6" }}>
                <td style={{ padding:"8px 12px" }}>{row.name}</td>
                <td style={{ padding:"8px 12px" }}>{row.artist_name}</td>
                <td style={{ padding:"8px 12px", maxWidth:520 }}>
                  {(row.rules_fired || []).slice(0,6).map((r:any,i:number)=>(
                    <span key={i} style={{ display:"inline-block", marginRight:8, marginBottom:6, padding:"4px 8px", borderRadius:8, background:"#f3f4f6" }}>
                      {r.rule}{r.term?`: ${r.term}`:""}{r.context?` (${r.context})`:""}
                    </span>
                  ))}
                  {(row.rules_fired || []).length > 6 && <span>…</span>}
                </td>
                <td style={{ padding:"8px 12px" }}>{row.decided_at ? new Date(row.decided_at).toLocaleString() : "-"}</td>
                <td style={{ padding:"8px 12px" }}>
                  <a href={`https://open.spotify.com/track/${row.spotify_id}`} target="_blank" rel="noreferrer">Ouvrir</a>
                </td>
              </tr>
            ))}
            {(!data?.items?.length && !loading) && <tr><td style={{ padding:16 }} colSpan={5}>Aucun résultat.</td></tr>}
          </tbody>
        </table>
      </div>

      <div style={{ display:"flex", gap:8, alignItems:"center", marginTop:12 }}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
          style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}>Précédent</button>
        <span>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)}
          style={{ padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8 }}
          disabled={!!data && data.items && data.items.length < pageSize}>Suivant</button>
      </div>
    </main>
  );
}