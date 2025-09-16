import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setSpotifyTokens } from '../utils/spotify-tokens'

export default function ParentCallback() {
  const [params] = useSearchParams()
  const nav = useNavigate()
  const [err, setErr] = useState<string | null>(null)
  const [debug, setDebug] = useState<string>('')

  useEffect(() => {
    const code = params.get('code')
    const state = params.get('state')
    const error = params.get('error')
    
    if (error) {
      setErr(`Erreur Spotify: ${error}`)
      return
    }
    
    if (!code) {
      setErr('Code d\'autorisation manquant')
      return
    }

    // Verify state
    const storedState = localStorage.getItem('spotify_auth_state')
    if (state !== storedState) {
      setErr('État de sécurité invalide')
      return
    }

    setDebug(`Code reçu: ${code.slice(0, 20)}...`)

    const exchangeToken = async () => {
      try {
        setDebug('Échange du code contre les tokens...')
        
        const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
        const clientSecret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
        const redirectUri = `${window.location.origin}/parent/callback`

        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret
          })
        })
        
        setDebug(`Réponse Spotify: ${response.status}`)
        
        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Échange échoué: ${response.status} - ${errorText}`)
        }

        const tokens = await response.json()
        setDebug('Tokens reçus, sauvegarde...')
        
        // Save tokens to localStorage
        setSpotifyTokens(tokens)
        
        // Clean up
        localStorage.removeItem('spotify_auth_state')
        
        setDebug('Succès ! Redirection...')
        nav('/player', { replace: true })
      } catch (error: any) {
        console.error('Token exchange error:', error)
        setDebug(`Erreur: ${error.message}`)
        setErr(error.message || 'Erreur lors de l\'échange des tokens')
      }
    }

    exchangeToken()
  }, [params, nav])

  if (err) {
    return (
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-xl font-semibold mb-2 text-red-600">Erreur d'authentification</h2>
        <p className="text-gray-600 mb-4">{err}</p>
        {debug && (
          <div className="bg-gray-100 p-3 rounded mb-4 text-sm text-left">
            <strong>Debug:</strong> {debug}
          </div>
        )}
        <div className="space-y-2">
          <a href="/player" className="block px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700">
            Réessayer l'authentification
          </a>
          <a href="/" className="block px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Retour à l'accueil
          </a>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-md mx-auto text-center">
      <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-green-600 rounded-full mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold mb-2">Connexion Spotify</h2>
      <p className="text-gray-600 mb-4">Traitement de l'authentification...</p>
      {debug && (
        <div className="mt-4 bg-gray-100 p-3 rounded text-sm">
          <strong>Debug:</strong> {debug}
        </div>
      )}
    </div>
  )
}