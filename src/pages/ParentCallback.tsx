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
    ;(async () => {
      try {
        const res = await fetch('/.netlify/functions/spotify-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code, state })
        })
        if (!res.ok) throw new Error(`Exchange ${res.status}`)
        nav('/player', { replace: true })
      } catch (e: any) {
        setErr(e.message || 'Erreur inconnue')
      }
    })()
  }, [])

  if (err) {
    const hint = err.includes('404')
      ? 'Fonction Netlify non déployée: /.netlify/functions/spotify-exchange'
      : "Erreur serveur lors de l'échange du code Spotify"
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Connexion Spotify impossible</h2>
        <p className="text-gray-600 mb-1">{hint}</p>
        <p className="text-xs text-gray-500 mb-4">Vérifie netlify.toml, _redirects, variables d'environnement, puis redeploie.</p>
        <a href="/" className="px-4 py-2 rounded-lg bg-black text-white inline-block">Retour à l'accueil</a>
      </div>
    )
  }
  return <div className="text-center text-gray-700">Connexion en cours…</div>
}