import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Heart, Clock, LogOut, Play } from 'lucide-react'

interface ChildSession {
  child: {
    id: string
    name: string
    emoji: string
    parent_id: string
  }
}

interface Favorite {
  id: string
  track_name: string
  artist_name: string
  added_at: string
}

export default function Child() {
  const navigate = useNavigate()
  const [childSession, setChildSession] = useState<ChildSession | null>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkChildSession()
    loadFavorites()
  }, [])

  const checkChildSession = () => {
    try {
      const sessionData = localStorage.getItem('child_session')
      if (!sessionData) {
        navigate('/child/login')
        return
      }

      const session = JSON.parse(sessionData) as ChildSession
      if (!session.child || !session.child.id) {
        navigate('/child/login')
        return
      }

      setChildSession(session)
    } catch (error) {
      console.error('Invalid child session:', error)
      navigate('/child/login')
    } finally {
      setLoading(false)
    }
  }

  const loadFavorites = () => {
    // Simuler des favoris récents pour la démo
    const mockFavorites: Favorite[] = [
      {
        id: '1',
        track_name: 'Let It Go',
        artist_name: 'Idina Menzel',
        added_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2h ago
      },
      {
        id: '2',
        track_name: 'Happy',
        artist_name: 'Pharrell Williams',
        added_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() // 1 day ago
      },
      {
        id: '3',
        track_name: 'Can\'t Stop the Feeling!',
        artist_name: 'Justin Timberlake',
        added_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
      }
    ]
    setFavorites(mockFavorites)
  }

  const handleSignOut = () => {
    localStorage.removeItem('child_session')
    navigate('/child/login')
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'1h'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Préparation de ton espace
          </p>
        </div>
      </div>
    )
  }

  if (!childSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Session expirée
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous reconnecter
          </p>
          <button
            onClick={() => navigate('/child/login')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{childSession.child.emoji}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Salut {childSession.child.name} ! 👋
                </h1>
                <p className="text-gray-600">Profite de ta musique préférée</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lecteur */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Lecteur Spotify
              </h2>
              <p className="text-gray-600 mb-6">
                Écoute tes chansons préférées en toute sécurité
              </p>
              <button
                onClick={() => navigate('/player')}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <div className="flex items-center space-x-2">
                  <Play className="w-5 h-5" />
                  <span>Ouvrir le lecteur</span>
                </div>
              </button>
            </div>
          </div>

          {/* Favoris récents */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Mes favoris récents</h2>
            </div>
            
            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aucun favori pour le moment
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Utilise le lecteur pour ajouter tes chansons préférées !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Music className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {favorite.track_name}
                      </h3>
                      <p className="text-purple-600 truncate text-sm">
                        {favorite.artist_name}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(favorite.added_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats amusantes */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">🎵 Tes stats du jour</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-sm opacity-90">Chansons écoutées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">12</div>
              <div className="text-sm opacity-90">Minutes d'écoute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-sm opacity-90">Favoris</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">🎉</div>
              <div className="text-sm opacity-90">Bonne humeur</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}