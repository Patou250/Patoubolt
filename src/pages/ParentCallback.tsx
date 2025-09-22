import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Music, CheckCircle, XCircle } from 'lucide-react'
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
      setError('Autorisation Spotify refusée')
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
      setStatus('Échange des tokens avec Spotify...')
      console.log('🔄 Échange du code pour les tokens')

      // Utiliser l'Edge Function pour l'échange de tokens
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const callbackUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=callback`
      
      console.log('📡 Calling Edge Function:', callbackUrl)
      
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

      console.log('📡 Edge Function response:', {
        status: tokenResponse.status,
        ok: tokenResponse.ok
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        console.error('❌ Erreur Edge Function:', errorText)
        throw new Error(`Erreur serveur: ${tokenResponse.status}`)
      }

      const responseData = await tokenResponse.json()
      console.log('✅ Response data received:', {
        hasTokens: !!responseData.tokens,
        hasUser: !!responseData.user,
        success: responseData.success
      })

      if (!responseData.success || !responseData.tokens) {
        throw new Error('Réponse invalide du serveur')
      }

      // Sauvegarder les tokens
      console.log('💾 Saving Spotify tokens...')
      setSpotifyTokens(responseData.tokens)
      
      // Créer session parent avec les données Spotify
      if (responseData.user) {
        const parentSession = {
          parent: {
            id: responseData.user.id,
            email: responseData.user.email,
            spotify_id: responseData.user.id,
            display_name: responseData.user.display_name
          },
          timestamp: Date.now()
        }
        localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
        console.log('✅ Session parent créée avec données Spotify')
      }

      setStatus('Connexion Spotify réussie !')
      setSuccess(true)
      
      setTimeout(() => {
        navigate('/parent/dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ Erreur lors du traitement:', error)
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
              <XCircle className="w-10 h-10 text-red-500" />
            ) : success ? (
              <CheckCircle className="w-10 h-10 text-green-500" />
            ) : (
              <Music className="w-10 h-10 text-emerald-600" />
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
                ✅ Spotify connecté avec succès ! Redirection en cours...
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