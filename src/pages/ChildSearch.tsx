import { useState, useEffect } from 'react'
import { Search, Play, Heart, Clock } from 'lucide-react'
import { getChildSession } from '../utils/child-auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'

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

export default function ChildSearch() {
  const [query, setQuery] = useState('')
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [childSession, setChildSession] = useState<any>(null)

  useEffect(() => {
    const session = getChildSession()
    if (!session) {
      window.location.href = '/child/login'
      return
    }
    setChildSession(session)
  }, [])

  const searchTracks = async () => {
    if (!query.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const tokens = getSpotifyTokens()
      if (!tokens) {
        setError('Connexion Spotify requise')
        return
      }

      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=FR&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        }
      )

      if (!response.ok) {
        throw new Error('Erreur de recherche')
      }

      const data = await response.json()
      // Filter out explicit content for children
      const filteredTracks = data.tracks.items.filter((track: Track) => !track.explicit)
      setTracks(filteredTracks)
    } catch (error) {
      console.error('Search error:', error)
      setError('Erreur lors de la recherche')
    } finally {
      setIsLoading(false)
    }
  }

  const playTrack = async (trackId: string) => {
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) return

      // This would integrate with your player
      console.log('Playing track:', trackId)
    } catch (error) {
      console.error('Play error:', error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!childSession) {
    return <div className="text-center">Chargement...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🔍 Recherche de musique
        </h1>
        <p className="text-gray-600">
          Trouve tes chansons préférées, {childSession.child.name} {childSession.child.emoji}
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher des chansons..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchTracks()}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={searchTracks}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Recherche...' : 'Rechercher'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results */}
      <div className="space-y-3">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          >
            <img
              src={track.album.images[2]?.url || track.album.images[0]?.url}
              alt={track.album.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">
                {track.name}
              </h3>
              <p className="text-sm text-gray-600 truncate">
                {track.artists.map(a => a.name).join(', ')}
              </p>
              <p className="text-xs text-gray-500">
                {track.album.name}
              </p>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              {formatDuration(track.duration_ms)}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => playTrack(track.id)}
                className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                title="Écouter"
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                title="Ajouter aux favoris"
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {tracks.length === 0 && query && !isLoading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun résultat trouvé
          </h3>
          <p className="text-gray-600">
            Essaie avec d'autres mots-clés
          </p>
        </div>
      )}

      {tracks.length === 0 && !query && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Prêt à découvrir de la musique ?
          </h3>
          <p className="text-gray-600">
            Tape le nom d'une chanson ou d'un artiste pour commencer
          </p>
        </div>
      )}
    </div>
  )
}