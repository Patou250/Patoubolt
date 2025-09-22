import React, { useState } from 'react'
import { Search, Play, Heart, Plus } from 'lucide-react'
import { useSpotifySearch } from '../react-hooks/useSpotifySearch'
import { useSpotifyPlayer } from '../react-hooks/useSpotifyPlayer'

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  explicit: boolean
}

interface SpotifySearchComponentProps {
  onTrackSelect?: (track: Track) => void
  onAddToPlaylist?: (track: Track) => void
  onAddToFavorites?: (track: Track) => void
  className?: string
}

export default function SpotifySearchComponent({ 
  onTrackSelect, 
  onAddToPlaylist, 
  onAddToFavorites,
  className = '' 
}: SpotifySearchComponentProps) {
  const [query, setQuery] = useState('')
  const { results, loading, error, search, clearResults } = useSpotifySearch()
  const { playTrack } = useSpotifyPlayer()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      search(query.trim())
    }
  }

  const handleTrackAction = async (track: Track, action: 'play' | 'playlist' | 'favorite') => {
    console.log('🎵 Track action:', action, 'for track:', track.name)
    
    switch (action) {
      case 'play':
        try {
          await playTrack(track.id)
          onTrackSelect?.(track)
          console.log('▶️ Playing track:', track.name)
        } catch (error) {
          console.error('❌ Play error:', error)
          alert('Erreur de lecture. Vérifiez que Spotify est ouvert.')
        }
        break
        
      case 'playlist':
        onAddToPlaylist?.(track)
        console.log('📝 Adding to playlist:', track.name)
        break
        
      case 'favorite':
        onAddToFavorites?.(track)
        // Add to localStorage favorites
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
          console.log('✅ Added to favorites:', track.name)
          alert('❤️ Ajouté aux favoris !')
        } catch (error) {
          console.error('❌ Error adding to favorites:', error)
        }
        break
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une chanson, artiste..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? 'Recherche...' : 'Rechercher'}
        </button>
      </form>

      {/* Clear Results */}
      {results.length > 0 && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {results.length} résultat{results.length > 1 ? 's' : ''}
          </h3>
          <button
            onClick={clearResults}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Effacer
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((track) => (
            <div
              key={track.id}
              className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-100 hover:border-green-300 hover:shadow-md transition-all"
            >
              <img
                src={track.album.images[2]?.url || track.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'}
                alt={`${track.album.name} cover`}
                className="w-12 h-12 rounded-lg object-cover"
              />
              
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {track.name}
                  {track.explicit && (
                    <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded">
                      E
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-600 truncate">
                  {track.artists.map(a => a.name).join(', ')} • {track.album.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDuration(track.duration_ms)} • Popularité: {track.popularity}/100
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTrackAction(track, 'favorite')}
                  className="p-2 hover:bg-pink-100 rounded-full transition-colors group"
                  title="Ajouter aux favoris"
                >
                  <Heart className="w-4 h-4 text-pink-500 group-hover:scale-110 transition-transform" />
                </button>
                
                {onAddToPlaylist && (
                  <button
                    onClick={() => handleTrackAction(track, 'playlist')}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    title="Ajouter à une playlist"
                  >
                    <Plus className="w-4 h-4 text-gray-600 group-hover:scale-110 transition-transform" />
                  </button>
                )}
                
                <button
                  onClick={() => handleTrackAction(track, 'play')}
                  className="p-2 hover:bg-green-100 rounded-full transition-colors group"
                  title="Écouter"
                >
                  <Play className="w-4 h-4 text-green-600 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Recherche en cours...</p>
        </div>
      )}
      
      {/* Empty State */}
      {!loading && query && results.length === 0 && !error && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🤔</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun résultat</h3>
          <p className="text-gray-600">
            Aucun résultat trouvé pour "{query}"
          </p>
        </div>
      )}
    </div>
  )
}