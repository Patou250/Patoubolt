import { useEffect, useState } from 'react'

export default function ParentSettings() {
  const [spotifyOk,setSpotifyOk]=useState<boolean>(false)
  useEffect(()=>{ (async()=>{
    try { const r=await fetch('/.netlify/functions/spotify-refresh',{credentials:'include'}); setSpotifyOk(r.ok) } catch {}
  })() },[])
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Réglages</h1>
      <div className="p-4 border rounded">
        <div className="font-medium mb-1">Spotify</div>
        <div>{spotifyOk ? '✅ Connecté' : '❌ Non connecté'}</div>
        {!spotifyOk && (
          <button onClick={() => window.location.assign('/.netlify/functions/spotify-auth-start')}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded">
            Connecter Spotify
          </button>
        )}
      </div>
    </div>
  )
}