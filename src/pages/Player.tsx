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
    // Check for tokens in localStorage first
    const tokens = getSpotifyTokens()
    if (tokens) {
      setToken(tokens.access_token)
      setIsLoading(false)
    } else {
      setErr('Authentification Spotify requise')
      setIsLoading(false)
    }
  }, [])

  const handleAuth = () => {
    // Direct Spotify OAuth flow
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = `${window.location.origin}/parent/callback`
    
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('spotify_auth_state', state)

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true&` +
      `state=${state}`

    window.location.href = authUrl
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
      <PlayerSdk accessToken={token} trackId={trackId} />
      <div className="mt-4 text-sm text-gray-600">Astuce : ouvrez l'app Spotify et transférez la lecture vers "Patou Player".</div>
    </div>
  )
}