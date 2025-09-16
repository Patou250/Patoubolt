import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, LogOut } from 'lucide-react'
import { getStoredTokens, clearTokens } from '../utils/spotify-auth'

export default function Parent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const tokens = getStoredTokens()
    if (!tokens) {
      navigate('/')
    } else {
      setIsAuthenticated(true)
    }
  }, [navigate])

  const handleSignOut = () => {
    clearTokens()
    navigate('/')
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patou</h1>
              <p className="text-gray-600">Espace Parent</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-white/50"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        {/* Player */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Music className="w-5 h-5 text-green-500" />
              Lecteur Spotify Parent
            </h2>
            <p className="text-gray-600">Contrôlez votre musique Spotify</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
            <Music className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Lecteur Spotify
            </h3>
            <p className="text-blue-700 mb-4">
              Le lecteur est temporairement désactivé pour résoudre des problèmes techniques.
            </p>
            <p className="text-sm text-blue-600">
              En attendant, vous pouvez utiliser l'application Spotify directement.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}