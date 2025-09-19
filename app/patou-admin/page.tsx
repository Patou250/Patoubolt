'use client';
import useSWR from 'swr';
import { useMemo, useState } from 'react';

const fetcher = (url: string) =>
  fetch(`/api/admin/songs${url.replace('/api/admin/songs', '')}`, { 
    headers: { 'x-admin-token': (process.env.NEXT_PUBLIC_ADMIN_TOKEN as string) } 
  })
    .then(r => { if (!r.ok) throw new Error('Forbidden or error'); return r.json(); });

export default function PatouAdmin() {
  const [status, setStatus] = useState<'allowed'|'blocked'>('allowed');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const url = useMemo(() =>
    `?status=${status}&q=${encodeURIComponent(q)}&page=${page}&pageSize=${pageSize}`,
    [status, q, page]
  );
  const { data, error, isLoading, mutate } = useSWR(url, fetcher);

  return (
    <main className="p-6 space-y-6">
      <header className="rounded-xl p-4 border bg-white">
        <h1 className="text-3xl font-extrabold tracking-tight">✅ PATOU ADMIN — Playlists & Modération</h1>
        <p className="text-sm text-gray-600 mt-1">
          Cette page est dédiée. Si tu vois ce header, tu es bien sur <b>/patou-admin</b>.
        </p>
      </header>

      <section className="flex items-center gap-3">
        <div className="inline-flex rounded-lg border overflow-hidden">
          <button onClick={()=>{setStatus('allowed'); setPage(1);}}
            className={`px-4 py-2 ${status==='allowed' ? 'bg-white' : 'bg-neutral-100'}`}>Autorisées</button>
          <button onClick={()=>{setStatus('blocked'); setPage(1);}}
            className={`px-4 py-2 ${status==='blocked' ? 'bg-white' : 'bg-neutral-100'}`}>Rejetées</button>
        </div>
        <input
          placeholder="Rechercher (titre ou artiste)…"
          value={q}
          onChange={e=>{setQ(e.target.value); setPage(1);}}
          className="px-3 py-2 border rounded-lg w-80"
        />
        <button onClick={()=>mutate()} className="px-3 py-2 border rounded-lg">Rafraîchir</button>
      </section>

      {isLoading && <div>Chargement…</div>}
      {error && <div className="text-red-600">Erreur: {String(error.message || error)}</div>}

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-neutral-50">
              <th className="text-left py-2 px-3">Titre</th>
              <th className="text-left px-3">Artiste</th>
              <th className="text-left px-3">Raisons</th>
              <th className="text-left px-3">Décision le</th>
              <th className="text-left px-3">Spotify</th>
            </tr>
          </thead>
          <tbody>
            {(data?.items || []).map((row: any) => (
              <tr key={row.id} className="border-b">
                <td className="py-2 px-3">{row.name}</td>
                <td className="px-3">{row.artist_name}</td>
                <td className="px-3 max-w-[520px]">
                  {(row.rules_fired || []).slice(0,6).map((r: any, i: number) => (
                    <span key={i} className="inline-block mr-2 mb-1 px-2 py-1 rounded bg-neutral-100">
                      {r.rule}{r.term?`: ${r.term}`:''}{r.context?` (${r.context})`:''}
                    </span>
                  ))}
                  {(row.rules_fired || []).length > 6 && <span>…</span>}
                </td>
                <td className="px-3">{row.decided_at ? new Date(row.decided_at).toLocaleString() : '-'}</td>
                <td className="px-3">
                  <a className="underline" href={`https://open.spotify.com/track/${row.spotify_id}`} target="_blank" rel="noreferrer">Ouvrir</a>
                </td>
              </tr>
            ))}
            {(!data?.items?.length && !isLoading) && (
              <tr><td className="py-4 px-3" colSpan={5}>Aucun résultat.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} className="px-3 py-2 border rounded-lg" disabled={page<=1}>Précédent</button>
        <span>Page {page}</span>
        <button onClick={()=>setPage(p=>p+1)} className="px-3 py-2 border rounded-lg"
          disabled={!!data && data.items && data.items.length < pageSize}>Suivant</button>
      </div>
    </main>
  );
}