import { useEffect, useState } from 'react'

type Track = { id:string; name:string; artists:{name:string}[]; album:{images:{url:string}[]} }

export default function ChildSearch() {
  const [token, setToken] = useState<string>(''); const [q,setQ]=useState(''); const [items,setItems]=useState<Track[]>([])
  const [err,setErr]=useState<string|undefined>(); const [adding,setAdding]=useState<string|undefined>()
  useEffect(()=>{ (async()=>{ try{ const r=await fetch('/.netlify/functions/spotify-refresh',{credentials:'include'}); if(!r.ok) throw new Error(String(r.status)); const d=await r.json(); setToken(d.access_token) }catch(e:any){ setErr('Parent non connecté à Spotify') } })() },[])
  const search=async(e?:React.FormEvent)=>{ e?.preventDefault(); if(!q||!token) return; const r=await fetch(`https://api.spotify.com/v1/search?type=track&limit=25&q=${encodeURIComponent(q)}`,{headers:{Authorization:`Bearer ${token}`}}); const d=await r.json(); setItems(d?.tracks?.items||[]) }
  const like=(t:Track)=>{ const payload={trackId:t.id,name:t.name,artist:t.artists.map(a=>a.name).join(', '),cover:t.album.images?.[0]?.url||'',ts:Date.now()}; const raw=localStorage.getItem('patou_favorites'); const map=raw?JSON.parse(raw):{}; map[t.id]=payload; localStorage.setItem('patou_favorites',JSON.stringify(map)) }
  const addToPlaylist=(t:Track)=>{ const name=prompt('Ajouter à quelle playlist ? (ou nouveau nom)'); if(!name) return; setAdding(t.id); const raw=localStorage.getItem('patou_child_playlists'); const all=raw?JSON.parse(raw):{}; const pl=all[name]||{name,tracks:[]}; if(!pl.tracks.find((x:any)=>x.trackId===t.id)){ pl.tracks.push({trackId:t.id,name:t.name,artist:t.artists.map(a=>a.name).join(', '),cover:t.album.images?.[0]?.url||''}) } all[name]=pl; localStorage.setItem('patou_child_playlists',JSON.stringify(all)); setAdding(undefined) }
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Rechercher des chansons</h1>
      {err && <div className="mb-4 p-3 border border-yellow-400 bg-yellow-50">{err}</div>}
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Titre, artiste…" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="px-4 py-2 bg-black text-white rounded">Rechercher</button>
      </form>
      <ul className="divide-y border rounded-lg">
        {items.map(t=>(
          <li key={t.id} className="p-3 flex items-center gap-3">
            {t.album.images?.[0]?.url && <img src={t.album.images[0].url} className="w-10 h-10 rounded" />}
            <div className="flex-1">
              <div className="font-medium">{t.name}</div>
              <div className="text-sm text-gray-500">{t.artists.map(a=>a.name).join(', ')}</div>
            </div>
            <a href={`/player?trackId=${t.id}`} className="text-sm underline">Lire</a>
            <button onClick={()=>like(t)} className="text-sm underline">❤️</button>
            <button onClick={()=>addToPlaylist(t)} className="text-sm underline">{adding===t.id?'…':'Ajouter à une playlist'}</button>
          </li>
        ))}
      </ul>
    </div>
  )
}