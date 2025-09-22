import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import PlayerSdk from '../components/PlayerSdk'
import { getSpotifyTokens } from '../utils/spotify-tokens'

export default function Player() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const trackId = params.get('trackId') || undefined

  useEffect(() => {
    console.log('🔄 Player page loading, checking tokens...')
    // Check for tokens in localStorage first
    const tokens = getSpotifyTokens()
    if (tokens) {
      console.log('✅ Spotify tokens found')
      setToken(tokens.access_token)
      setIsLoading(false)
    } else {
      console.log('❌ No Spotify tokens found')
      setErr('Authentification Spotify requise')
      setIsLoading(false)
    }
  }, [])

  const handleAuth = () => {
    console.log('🔗 Starting Spotify auth from Player...')
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const authUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=login`
    
    fetch(authUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      if (data.authorize_url) {
        localStorage.setItem('spotify_auth_state', data.state)
        window.location.href = data.authorize_url
      } else {
        console.error('❌ Erreur auth response:', data)
        alert('Erreur: ' + (data.error || 'Réponse invalide'))
      }
    })
    .catch(error => {
      console.error('Error starting Spotify auth:', error)
      alert('Erreur de connexion: ' + error.message)
    })
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="md:ml-64">
        <div className="p-4 md:p-8">
          <div className="max-w-2xl mx-auto">
      <PlayerSdk accessToken={token} trackId={trackId} />
      <div className="mt-4 text-sm text-gray-600">Astuce : ouvrez l'app Spotify et transférez la lecture vers "Patou Player".</div>
          </div>
        </div>
      </div>
    </div>
  )
}