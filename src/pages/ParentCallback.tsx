import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ParentCallback() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state') || ''
    if (!code) { setErr('Code Spotify manquant'); return }

    (async () => {
      try {
        // échange code -> tokens + persistance côté serveur
        const res = await fetch('/.netlify/functions/spotify-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code, state })
        })
        if (!res.ok) throw new Error(`Exchange failed (${res.status})`)
        // redirige onboarding si pas d'enfants créés
        const next = new URLSearchParams(location.search).get('next')
        nav(next === 'connect-spotify' ? '/parent/children' : '/parent/dashboard', { replace: true })
      } catch (e:any) {
        setErr(e.message)
      }
    })()
  }, [])

  if (err) return <div className="p-6 text-red-400">Erreur: {err}</div>
  return <div className="p-6">Connexion Spotify…</div>
}