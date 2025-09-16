import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Music } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function ParentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState('Traitement de la connexion Spotify...')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const errorParam = searchParams.get('error')

      if (errorParam) {
        setError('Autorisation Spotify refusée')
        return
      }

      if (!code || !state) {
        setError('Paramètres d\'autorisation manquants')
        return
      }

      try {
        setStatus('Échange des tokens Spotify...')
        
        // Appel de la fonction serveur d'échange
        const response = await fetch('/.netlify/functions/spotify-exchange', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ code, state })
        })

        if (!response.ok) {
          throw new Error(`Erreur d'échange: ${response.status}`)
        }

        setStatus('Vérification du profil parent...')

        // Redirection simple vers le dashboard
        setStatus('Redirection vers le tableau de bord...')
        navigate('/parent/dashboard', { replace: true })

      } catch (error) {
        console.error('Erreur callback Spotify:', error)
        setError(error instanceof Error ? error.message : 'Erreur inconnue')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  const handleRetry = () => {
    navigate('/parent/login', { replace: true })
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-patou-main-50 to-protect-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Music className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Erreur de connexion
          </h1>
          
          <p className="text-gray-600 mb-6">
            {error}
          </p>
          
          <button
            onClick={handleRetry}
            className="w-full bg-patou-main text-white py-3 px-6 rounded-xl font-semibold hover:bg-patou-main-600 transition-colors"
          >
            Réessayer
          </button>
          
          <p className="text-sm text-gray-500 mt-4">
            Vous serez redirigé vers la page de connexion
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-patou-main-50 to-protect-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-patou-main rounded-full flex items-center justify-center mx-auto mb-6">
          <Music className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Patou
        </h1>
        
        <p className="text-gray-600 mb-6">
          {status}
        </p>
        
        <div className="animate-spin w-8 h-8 border-2 border-patou-main border-t-transparent rounded-full mx-auto"></div>
      </div>
    </div>
  )
}