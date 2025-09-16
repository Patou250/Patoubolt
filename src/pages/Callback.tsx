import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import { storeTokens, exchangeCodeForTokens } from '../utils/spotify-auth'

export default function Callback() {
  const [status, setStatus] = useState('Traitement...')
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        setStatus('Erreur d\'autorisation')
        return
      }

      if (!code) {
        setStatus('Code d\'autorisation manquant')
        return
      }

      try {
        const tokens = await exchangeCodeForTokens(code)
        storeTokens(tokens)
        
        setStatus('Connexion réussie!')
        setTimeout(() => navigate('/parent'), 1000)
      } catch (error) {
        console.error('Token exchange error:', error)
        setStatus('Erreur lors de l\'échange de tokens')
      }
    }

    handleCallback()
  }, [navigate])

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