import { useEffect, useState } from 'react'

export default function ChildPlaylists(){
  const [pls,setPls]=useState<any>({})
  const [name,setName]=useState('')
  const load=()=>{ const raw=localStorage.getItem('patou_child_playlists'); setPls(raw?JSON.parse(raw):{}) }
  useEffect(load,[])
  const create=(e:React.FormEvent)=>{ e.preventDefault(); if(!name.trim()) return; const all={...pls,[name]:{name,tracks:[]}}; localStorage.setItem('patou_child_playlists',JSON.stringify(all)); setName(''); setPls(all) }
  const del=(plName:string)=>{ if(!confirm(`Supprimer "${plName}" ?`)) return; const all={...pls}; delete all[plName]; localStorage.setItem('patou_child_playlists',JSON.stringify(all)); setPls(all) }
  const playPlaylist=(pl:any)=>{ if(!pl.tracks?.length) return; const firstTrack=pl.tracks[0]; window.location.href=`/player?trackId=${firstTrack.trackId}` }
  
  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Mes playlists</h1>
      <form onSubmit={create} className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nom de la nouvelle playlist" className="flex-1 border rounded-lg px-3 py-2" />
        <button className="px-4 py-2 bg-black text-white rounded">Créer</button>
      </form>
      
      {Object.keys(pls).length === 0 ? (
        <p className="text-gray-500 text-center py-8">Aucune playlist. Crée-en une ou ajoute des chansons depuis la recherche !</p>
      ) : (
        <div className="space-y-3">
          {Object.values(pls).map((pl:any) => (
            <div key={pl.name} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">{pl.name}</h3>
                <div className="flex gap-2">
                  {pl.tracks?.length > 0 && (
                    <button onClick={()=>playPlaylist(pl)} className="text-sm bg-green-500 text-white px-3 py-1 rounded">
                      ▶ Lire
                    </button>
                  )}
                  <button onClick={()=>del(pl.name)} className="text-sm text-red-600 underline">Supprimer</button>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-3">{pl.tracks?.length || 0} chanson{(pl.tracks?.length || 0) !== 1 ? 's' : ''}</p>
              
              {pl.tracks?.length > 0 && (
                <ul className="space-y-2">
                  {pl.tracks.map((t:any, i:number) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      {t.cover && <img src={t.cover} className="w-8 h-8 rounded" />}
                      <div className="flex-1">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-gray-500">{t.artist}</div>
                      </div>
                      <a href={`/player?trackId=${t.trackId}`} className="text-blue-600 underline">Lire</a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}