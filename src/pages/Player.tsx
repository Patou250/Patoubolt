import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PlayerSdk from '../components/PlayerSdk'

export default function Player() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true)
        const res = await fetch('/.netlify/functions/spotify-refresh', { credentials: 'include' })
        
        if (res.status === 401) {
          // No valid tokens, redirect to auth
          setErr('Authentification Spotify requise')
          return
        }
        
        if (!res.ok) {
          throw new Error(`Refresh failed: ${res.status}`)
        }
        
        const data = await res.json()
        if (!data?.access_token) {
          throw new Error('Pas de access_token')
        }
        setToken(data.access_token)
      } catch (e:any) {
        setErr(e.message || 'Erreur inconnue')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleAuth = () => {
    window.location.href = '/.netlify/functions/spotify-auth/start'
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto text-center">
        <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Vérification de l'authentification...</p>
      </div>
    )
  }

  if (err) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2">Lecteur indisponible</h2>
        <p className="text-gray-600 mb-4">{err}</p>
        <div className="space-y-3">
          <button
            onClick={handleAuth}
            className="w-full px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
          >
            Se connecter avec Spotify
          </button>
          <a 
            href="/" 
            className="block px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PlayerSdk accessToken={token} />
      <div className="mt-4 text-sm text-gray-600">Astuce : ouvrez l'app Spotify et transférez la lecture vers "Patou Player".</div>
    </div>
  )
}