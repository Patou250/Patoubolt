import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setSpotifyTokens } from '../utils/spotify-tokens'

export default function ParentCallback() {
  const [status, setStatus] = useState('Traitement de la connexion Spotify...')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    console.log('🔄 Processing Spotify callback')
    
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const errorParam = searchParams.get('error')

    console.log('📝 Callback params:', { hasCode: !!code, hasState: !!state, error: errorParam })

    if (errorParam) {
      console.error('❌ Spotify authorization error:', errorParam)
      setError('Autorisation Spotify refusée')
      return
    }

    if (!code) {
      console.error('❌ No authorization code')
      setError('Code d\'autorisation manquant')
      return
    }

    // Verify state
    const storedState = localStorage.getItem('spotify_auth_state')
    if (state !== storedState) {
      console.error('❌ State mismatch')
      setError('Erreur de sécurité')
      return
    }

    console.log('✅ State verified')
    localStorage.removeItem('spotify_auth_state')

    try {
      setStatus('Échange des tokens avec Spotify...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const callbackUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=callback`
      
      console.log('📡 Calling Edge Function for token exchange')
      
      const response = await fetch(callbackUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, state })
      })

      console.log('📡 Token exchange response:', response.status)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Token exchange error:', errorText)
        throw new Error(`Erreur serveur: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Token exchange successful')

      if (!data.success || !data.tokens) {
        throw new Error('Réponse invalide du serveur')
      }

      // Save tokens
      console.log('💾 Saving Spotify tokens')
      setSpotifyTokens(data.tokens)
      
      // Create/update parent session
      if (data.user) {
        const parentSession = {
          parent: {
            id: data.user.id,
            email: data.user.email,
            spotify_id: data.user.id,
            display_name: data.user.display_name
          },
          timestamp: Date.now()
        }
        localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
        console.log('✅ Parent session updated with Spotify data')
      }

      setStatus('Connexion Spotify réussie !')
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/parent/dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ Callback processing error:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
      setStatus('Erreur lors de la connexion')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
        <div className="text-center space-y-6">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-100">
            {error ? (
              <span className="text-3xl">❌</span>
            ) : success ? (
              <span className="text-3xl">✅</span>
            ) : (
              <span className="text-3xl">🎵</span>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Patou</h1>
            <p className="text-gray-600">{status}</p>
          </div>

          {error ? (
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
              <button
                onClick={() => navigate('/parent/dashboard')}
                className="w-full px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
              >
                Retour au tableau de bord
              </button>
            </div>
          ) : success ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-sm">
                ✅ Spotify connecté ! Redirection...
              </p>
            </div>
          ) : (
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
          )}
        </div>
      </div>
    </div>
  )
}