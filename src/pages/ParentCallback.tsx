import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

export default function ParentCallback() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state') || ''
    
    setDebug(`Code reçu: ${code?.slice(0, 20)}...`)
    
    if (!code) { setErr('Code Spotify manquant'); return }

    ;(async () => {
      try {
        setDebug('Tentative d\'échange du code...')
        const res = await fetch('/.netlify/functions/spotify-exchange', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ code, state })
        })
        
        setDebug(`Réponse: ${res.status} ${res.statusText}`)
        
        if (!res.ok) throw new Error(`Exchange failed: ${res.status}`)
        
        setDebug('Échange réussi, redirection...')
        nav('/player', { replace: true })
      } catch (e:any) {
        setDebug(`Erreur: ${e.message}`)
        setErr(e.message || 'Erreur inconnue')
      }
    })()
  }, [])

  if (err) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Connexion Spotify impossible</h2>
        <p className="text-gray-600 mb-4">{err}</p>
        <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-left">
          <strong>Debug:</strong> {debug}
        </div>
        <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4 text-sm">
          <strong>Note:</strong> Les fonctions Netlify sont en cours de déploiement. 
          Réessayez dans quelques minutes.
        </div>
        <a href="/" className="px-4 py-2 rounded-lg bg-black text-white">Retour à l'accueil</a>
      </div>
    )
  }
  
  return (
    <div className="text-center text-gray-700">
      <div>Connexion en cours…</div>
      {debug && (
        <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
          <strong>Debug:</strong> {debug}
        </div>
      )}
    </div>
  )
}