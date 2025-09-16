import { useEffect, useState } from 'react'
import PlayerSdk from '../components/PlayerSdk'

export default function Player() {
  const [token, setToken] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/.netlify/functions/spotify-refresh', { credentials: 'include' })
        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`)
        const data = await res.json()
        if (!data?.access_token) throw new Error('Pas de access_token')
        setToken(data.access_token)
      } catch (e:any) {
        setErr(e.message || 'Erreur inconnue')
      }
    })()
  }, [])

  if (err) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Lecteur indisponible</h2>
        <p className="text-gray-600 mb-4">{err}</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-black text-white">Retour à l'accueil</a>
      </div>
    )
  }

  if (!token) {
    return <div className="text-center text-gray-700">Initialisation du lecteur…</div>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PlayerSdk accessToken={token} />
      <div className="mt-4 text-sm text-gray-600">Astuce : ouvrez l'app Spotify et transférez la lecture vers "Patou Player".</div>
    </div>
  )
}