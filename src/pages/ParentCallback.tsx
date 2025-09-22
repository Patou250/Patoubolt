import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Music } from 'lucide-react'

export default function ParentCallback() {
  const [status, setStatus] = useState('Traitement...')
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 Début du traitement du callback Spotify')
      
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      console.log('📝 Paramètres reçus:', {
        hasCode: !!code,
        hasState: !!state,
        error: errorParam
      })

      if (errorParam) {
        console.error('❌ Erreur d\'autorisation Spotify:', errorParam)
        setError('Erreur d\'autorisation Spotify')
        setStatus('Erreur d\'autorisation')
        return
      }

      if (!code) {
        console.error('❌ Code d\'autorisation manquant')
        setError('Code d\'autorisation manquant')
        setStatus('Code d\'autorisation manquant')
        return
      }

      // Vérifier le state
      const storedState = localStorage.getItem('spotify_auth_state')
      if (state !== storedState) {
        console.error('❌ State mismatch:', { received: state, stored: storedState })
        setError('Paramètre state invalide')
        setStatus('Erreur de sécurité')
        return
      }

      console.log('✅ State vérifié')
      localStorage.removeItem('spotify_auth_state')

      try {
        setStatus('Échange des tokens...')
        console.log('🔄 Échange du code pour les tokens')

        // Utiliser l'Edge Function pour l'échange de tokens
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
        const callbackUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=callback`
        
        const tokenResponse = await fetch(callbackUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            code: code,
            state: state
          })
        })

        console.log('📡 Réponse Spotify:', {
          status: tokenResponse.status,
          ok: tokenResponse.ok
        })

        if (!tokenResponse.ok) {
          const errorText = await tokenResponse.text()
          console.error('❌ Erreur échange tokens:', errorText)
          throw new Error(`Erreur Spotify: ${tokenResponse.status}`)
        }

        const tokens = await tokenResponse.json()
        console.log('✅ Tokens reçus:', {
          hasAccessToken: !!tokens.access_token,
          hasRefreshToken: !!tokens.refresh_token,
          expiresIn: tokens.expires_in
        })

        // Sauvegarder les tokens
        const tokenData = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expires_in,
          token_type: tokens.token_type,
          scope: tokens.scope,
          expires_at: Date.now() + (tokens.expires_in * 1000)
        }

        localStorage.setItem('spotify_tokens', JSON.stringify(tokenData))
        console.log('💾 Tokens sauvegardés')

        // Create parent session with Spotify data
        const parentSession = {
          parent: {
            id: user.id,
            email: user.email,
            spotify_id: user.id
          },
          timestamp: Date.now()
        }
        localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
        
        // Récupérer les infos utilisateur Spotify
        setStatus('Récupération du profil...')
        const userResponse = await fetch('https://api.spotify.com/v1/me', {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        })

        if (userResponse.ok) {
          const user = await userResponse.json()
          console.log('👤 Utilisateur Spotify:', {
            id: user.id,
            email: user.email,
            displayName: user.display_name
          })

          // Créer une session parent
          const parentSession = {
            parent: {
              id: user.id,
              email: user.email,
              spotify_id: user.id
            },
            timestamp: Date.now()
          }

          localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
          console.log('✅ Session parent créée')
        }

        setStatus('Connexion réussie!')
        setTimeout(() => {
          navigate('/parent/dashboard')
        }, 1000)

      } catch (error) {
        console.error('❌ Erreur lors du traitement:', error)
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
        setStatus('Erreur lors de l\'échange de tokens')
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-6">
            <span className="text-white text-2xl">❌</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur</h1>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <div className="text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Patou</h1>
            <p className="text-gray-600 mt-2">{status}</p>
          </div>
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        </div>
      </div>
    </div>
  )
}