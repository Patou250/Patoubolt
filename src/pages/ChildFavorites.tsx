import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface FavoriteTrack {
  trackId: string
  name: string
  artist: string
  cover: string
  ts: number
}

export default function ChildFavorites() {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    try {
      console.log('❤️ Loading favorites...')
      const favsRaw = localStorage.getItem('patou_favorites')
      if (favsRaw) {
        const favsData = JSON.parse(favsRaw)
        const favsList = Object.values(favsData) as FavoriteTrack[]
        favsList.sort((a, b) => b.ts - a.ts)
        setFavorites(favsList)
        console.log('✅ Favorites loaded:', favsList.length)
      } else {
        console.log('📝 No favorites, using mock data')
        const mockFavorites: FavoriteTrack[] = [
          {
            trackId: '3n3Ppam7vgaVa1iaRUc9Lp',
            name: 'Hakuna Matata',
            artist: 'Le Roi Lion',
            cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
            ts: Date.now() - 1000000
          },
          {
            trackId: '2',
            name: 'Let It Go',
            artist: 'La Reine des Neiges',
            cover: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=100',
            ts: Date.now() - 2000000
          }
        ]
        setFavorites(mockFavorites)
      }
    } catch (error) {
      console.error('❌ Error loading favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = async (trackId: string) => {
    console.log('▶️ Playing from favorites:', trackId)
    
    const tokens = getSpotifyTokens()
    if (!tokens) {
      alert('Demande à tes parents de connecter Spotify !')
      return
    }

    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${tokens.access_token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          uris: [`spotify:track:${trackId}`] 
        })
      })

      if (response.ok) {
        alert('🎵 Lecture démarrée !')
      } else {
        alert('Ouvre Spotify d\'abord !')
      }
    } catch (error) {
      console.error('❌ Play error:', error)
      alert('Erreur de lecture')
    }
  }

  const handleRemoveFavorite = (trackId: string) => {
    console.log('➖ Removing from favorites:', trackId)
    
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      delete favs[trackId]
      localStorage.setItem('patou_favorites', JSON.stringify(favs))
      loadFavorites()
      console.log('✅ Removed from favorites')
    } catch (error) {
      console.error('❌ Error removing favorite:', error)
    }
  }

  const handleBack = () => {
    console.log('🔙 Back to child home')
    navigate('/child')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-pink-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des favoris...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              ←
            </button>
            <img src="/patou-logo.svg" alt="Patou" className="h-8" />
            <span className="text-xl font-bold text-gray-800">Mes Favoris</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {favorites.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-12 border border-white/20 text-center">
            <div className="text-6xl mb-6">💖</div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun favori</h3>
            <p className="text-gray-600 mb-6">
              Découvre de nouvelles chansons et ajoute-les à tes favoris
            </p>
            <button
              onClick={() => navigate('/child/search')}
              className="px-6 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors"
            >
              🔍 Rechercher de la musique
            </button>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              ❤️ Tes chansons préférées ({favorites.length})
            </h2>
            
            <div className="space-y-3">
              {favorites.map((track) => (
                <div
                  key={track.trackId}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img 
                    src={track.cover} 
                    alt={track.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{track.name}</h4>
                    <p className="text-sm text-gray-600 truncate">{track.artist}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleRemoveFavorite(track.trackId)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Retirer des favoris"
                    >
                      🗑️
                    </button>
                    <button
                      onClick={() => handlePlayTrack(track.trackId)}
                      className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      title="Écouter"
                    >
                      ▶️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 p-4">
        <div className="max-w-md mx-auto flex justify-around">
          <button
            onClick={() => navigate('/child')}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">🎵</span>
            <span className="text-xs font-medium">Player</span>
          </button>
          
          <button
            onClick={() => navigate('/child/search')}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">🔍</span>
            <span className="text-xs font-medium">Recherche</span>
          </button>
          
          <button
            onClick={() => navigate('/child/favorites')}
            className="flex flex-col items-center py-2 px-4 text-pink-600 bg-pink-100 rounded-lg"
          >
            <span className="text-xl mb-1">❤️</span>
            <span className="text-xs font-medium">Favoris</span>
          </button>
        </div>
      </div>
    </div>
  )
}