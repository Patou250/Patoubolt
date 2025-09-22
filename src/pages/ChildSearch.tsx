import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
  duration_ms: number
  explicit: boolean
}

export default function ChildSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSearch = async () => {
    if (!query.trim()) return
    
    console.log('🔍 Searching for:', query)
    setLoading(true)
    setError(null)
    
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) {
        setError('Demande à tes parents de connecter Spotify')
        return
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        }
      )

      if (!response.ok) {
        console.error('❌ Search error:', response.status)
        setError('Erreur de recherche')
        return
      }

      const data = await response.json()
      console.log('✅ Search results:', data.tracks?.items?.length || 0)
      setResults(data.tracks.items || [])
      
      if (data.tracks.items.length === 0) {
        setError(`Aucun résultat pour "${query}"`)
      }
    } catch (err) {
      console.error('❌ Search error:', err)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = async (track: Track) => {
    console.log('▶️ Playing:', track.name)
    
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
          uris: [`spotify:track:${track.id}`] 
        })
      })

      if (response.ok) {
        console.log('✅ Track started')
        
        // Save to history
        const historyItem = {
          trackId: track.id,
          name: track.name,
          artist: track.artists.map(a => a.name).join(', '),
          cover: track.album.images?.[0]?.url || '',
          ts: Date.now()
        }
        
        const historyRaw = localStorage.getItem('patou_play_history')
        const history = historyRaw ? JSON.parse(historyRaw) : []
        history.unshift(historyItem)
        if (history.length > 100) history.pop()
        localStorage.setItem('patou_play_history', JSON.stringify(history))
        
        alert('🎵 Lecture démarrée !')
      } else {
        console.error('❌ Play error:', response.status)
        alert('Ouvre Spotify d\'abord !')
      }
    } catch (error) {
      console.error('❌ Play error:', error)
      alert('Erreur de lecture')
    }
  }

  const handleAddToFavorites = (track: Track) => {
    console.log('❤️ Adding to favorites:', track.name)
    
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      
      favs[track.id] = {
        trackId: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        cover: track.album.images?.[0]?.url || '',
        ts: Date.now()
      }
      
      localStorage.setItem('patou_favorites', JSON.stringify(favs))
      console.log('✅ Added to favorites')
      alert('❤️ Ajouté aux favoris !')
    } catch (error) {
      console.error('❌ Error adding to favorites:', error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleBack = () => {
    console.log('🔙 Back to child home')
    navigate('/child')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
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
            <span className="text-xl font-bold text-gray-800">Recherche</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 pb-20">
        {/* Search Bar */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex gap-3">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher une chanson, artiste..."
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold rounded-xl transition-colors"
            >
              {loading ? '⏳' : '🔍'}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-700 text-center">{error}</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              🎵 {results.length} résultat{results.length > 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-3">
              {results.map((track) => (
                <div
                  key={track.id}
                  className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={track.album.images[2]?.url || track.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'}
                    alt={track.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">
                      {track.name}
                      {track.explicit && (
                        <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                          E
                        </span>
                      )}
                    </h4>
                    <p className="text-sm text-gray-600 truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDuration(track.duration_ms)}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToFavorites(track)}
                      className="p-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                      title="Ajouter aux favoris"
                    >
                      ❤️
                    </button>
                    <button
                      onClick={() => handlePlayTrack(track)}
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

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
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
            onClick={handleSearch}
            className="flex flex-col items-center py-2 px-4 text-blue-600 bg-blue-100 rounded-lg"
          >
            <span className="text-xl mb-1">🔍</span>
            <span className="text-xs font-medium">Recherche</span>
          </button>
          
          <button
            onClick={handleFavorites}
            className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <span className="text-xl mb-1">❤️</span>
            <span className="text-xs font-medium">Favoris</span>
          </button>
        </div>
      </div>
    </div>
  )
}