import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Play, Heart, ArrowLeft } from 'lucide-react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

type Track = {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
  duration_ms: number
}

export default function ChildSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    
    setErr(null)
    setLoading(true)
    
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) {
        throw new Error('Connexion Spotify requise')
      }

      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
      
      if (!res.ok) {
        throw new Error('Erreur de recherche')
      }
      
      const data = await res.json()
      setResults(data.tracks.items || [])
    } catch (e: any) {
      setErr(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const addToFavorites = (track: Track) => {
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
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/child" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">🔍 Recherche</h1>
        </div>

        {/* Search Form */}
        <form onSubmit={search} className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Rechercher une chanson, un artiste..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-lg"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="w-full mt-3 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            {loading ? 'Recherche...' : 'Chercher'}
          </button>
        </form>

        {/* Error Message */}
        {err && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700 text-sm">{err}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Recherche en cours...</p>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </h2>
            {results.map(track => (
              <div key={track.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  {/* Album Cover */}
                  <div className="flex-shrink-0">
                    <img
                      src={track.album.images?.[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'}
                      alt={track.album.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  </div>
                  
                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{track.name}</h3>
                    <p className="text-gray-600 text-sm truncate">
                      {track.artists.map(a => a.name).join(', ')}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatDuration(track.duration_ms)}
                    </p>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToFavorites(track)}
                      className="flex items-center justify-center w-10 h-10 bg-pink-50 hover:bg-pink-100 text-pink-500 rounded-full transition-colors"
                      title="Ajouter aux favoris"
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <Link
                      to={`/player?trackId=${track.id}`}
                      className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors"
                      title="Écouter"
                    >
                      <Play className="w-5 h-5 ml-0.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && query && results.length === 0 && !err && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤔</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun résultat</h3>
            <p className="text-gray-600">
              Essaie avec d'autres mots-clés pour "{query}"
            </p>
          </div>
        )}

        {/* Empty State */}
        {!query && results.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Prêt à découvrir ?</h3>
            <p className="text-gray-600">
              Tape le nom d'une chanson ou d'un artiste pour commencer
            </p>
          </div>
        )}
      </div>
    </div>
  )
}