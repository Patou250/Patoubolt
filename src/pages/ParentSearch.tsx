import { useState } from 'react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

type Track = {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
}

export default function ParentSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      // Get tokens from localStorage
      const tokens = getSpotifyTokens()
      if (!tokens) throw new Error('Non connecté à Spotify')

      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
      if (!res.ok) throw new Error('Erreur API Spotify')
      const data = await res.json()
      setResults(data.tracks.items || [])
    } catch (e: any) {
      setErr(e.message)
    } finally {
      setLoading(false)
    }
  }

  const playTrack = async (trackId: string) => {
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) throw new Error('Non connecté à Spotify')
      
      await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${tokens.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ uris: [`spotify:track:${trackId}`] })
      })
    } catch (e) {
      console.error('Impossible de jouer ce titre', e)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Recherche Spotify</h1>
      <form onSubmit={search} className="flex gap-2 mb-4">
        <input 
          className="flex-1 border rounded px-3 py-2" 
          value={query} 
          onChange={e => setQuery(e.target.value)} 
          placeholder="Rechercher une chanson, artiste…" 
        />
        <button className="px-4 py-2 bg-black text-white rounded" disabled={loading}>
          {loading ? 'Recherche...' : 'Chercher'}
        </button>
      </form>
      
      {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm">{err}</div>}
      
      {loading && <div className="text-center py-4">Recherche en cours...</div>}
      
      <div className="space-y-3">
        {results.map(track => (
          <div key={track.id} className="flex items-center gap-3 p-3 border rounded-lg">
            {track.album.images[0] && (
              <img 
                src={track.album.images[0].url} 
                alt={track.name}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{track.name}</div>
              <div className="text-sm text-gray-500">
                {track.artists.map(a => a.name).join(', ')}
              </div>
            </div>
            <button
              onClick={() => playTrack(track.id)}
              className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Jouer
            </button>
          </div>
        ))}
      </div>
      
      {results.length === 0 && query && !loading && (
        <div className="text-center py-8 text-gray-500">
          Aucun résultat trouvé pour "{query}"
        </div>
      )}
    </div>
  )
}