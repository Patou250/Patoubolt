import { useState } from 'react'
import { 
  App, Page, Navbar, Block, List, ListItem, Button,
  Actions, ActionsGroup, ActionsButton, Card
} from 'konsta/react'
import { Play, Heart, Plus, Music, Search } from 'lucide-react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

type Track = {
  id: string
  name: string
  artists: { name: string }[]
  album: { images: { url: string }[] }
  duration_ms: number
  explicit: boolean
}

type Playlist = {
  id: string
  name: string
}

export default function ChildSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [showActions, setShowActions] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    
    try {
      console.log('🔍 Starting search for:', query)
      const tokens = getSpotifyTokens()
      if (!tokens) {
        console.error('❌ No Spotify tokens available')
        setError('Connexion Spotify requise. Demande à tes parents de connecter Spotify.')
        return
      }

      console.log('📡 Making Spotify API request...')
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
        {
          headers: {
            'Authorization': `Bearer ${tokens.access_token}`
          }
        }
      )

      console.log('📡 Spotify API response:', response.status, response.ok)
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('❌ Spotify token expired')
          setError('Session Spotify expirée. Demande à tes parents de se reconnecter.')
        } else {
          console.error('❌ Spotify API error:', response.status)
          setError('Erreur de recherche. Réessaie dans quelques secondes.')
        }
        return
      }

      const data = await response.json()
      console.log('✅ Search results:', data.tracks?.items?.length || 0, 'tracks')
      setResults(data.tracks.items || [])
      
      if (data.tracks.items.length === 0) {
        setError(`Aucun résultat trouvé pour "${query}"`)
      }
    } catch (err) {
      console.error('❌ Search error:', err)
      setError('Erreur de connexion. Vérifie ta connexion internet.')
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = async (track: Track) => {
    console.log('▶️ Playing track:', track.name)
    
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
        console.log('✅ Track started successfully')
        
        // Sauvegarder dans l'historique
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
        localStorage.setItem('patou_last_track', JSON.stringify(historyItem))
        
        alert('🎵 Lecture démarrée !')
      } else {
        console.error('❌ Spotify play error:', response.status)
        if (response.status === 404) {
          alert('Ouvre l\'application Spotify sur ton téléphone ou ordinateur d\'abord !')
        } else {
          alert('Erreur de lecture. Assure-toi que Spotify est ouvert.')
        }
      }
    } catch (error) {
      console.error('❌ Error playing track:', error)
      alert('Erreur de connexion. Vérifie ta connexion internet.')
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
      console.log('✅ Added to favorites:', track.name)
      alert('❤️ Ajouté aux favoris !')
    } catch (error) {
      console.error('❌ Error adding to favorites:', error)
      alert('Erreur lors de l\'ajout aux favoris')
    }
  }

  const handleAddToPlaylist = (track: Track) => {
    console.log('📋 Adding to playlist:', track.name)
    setSelectedTrack(track)
    loadPlaylists()
    setShowActions(true)
  }

  const loadPlaylists = () => {
    const mockPlaylists: Playlist[] = [
      { id: '1', name: 'Mes Disney préférés' },
      { id: '2', name: 'Comptines du soir' },
      { id: '3', name: 'Musiques de films' }
    ]
    setPlaylists(mockPlaylists)
  }

  const handleAddTrackToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      console.log(`📋 Adding "${selectedTrack.name}" to playlist ${playlistId}`)
      alert(`Chanson ajoutée à la playlist !`)
      setShowActions(false)
      setSelectedTrack(null)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Recherche" />
        
        <div className="space-y-6 p-4 pb-20">
          {/* Barre de recherche */}
          <Block>
            <Card className="p-4">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Rechercher une chanson, artiste..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-base"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                  />
                </div>
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 min-h-[48px]"
                  onClick={handleSearch}
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'Chercher'
                  )}
                </Button>
              </div>
            </Card>
          </Block>

          {/* Messages d'erreur */}
          {error && (
            <Block>
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </Card>
            </Block>
          )}

          {/* Résultats de recherche */}
          {results.length > 0 && (
            <Block>
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                🎵 {results.length} résultat{results.length > 1 ? 's' : ''}
              </h3>
              
              <List mediaList>
                {results.map((track) => (
                  <ListItem
                    key={track.id}
                    title={
                      <div className="flex items-center gap-2">
                        <span className="truncate">{track.name}</span>
                        {track.explicit && (
                          <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded">
                            E
                          </span>
                        )}
                      </div>
                    }
                    subtitle={
                      <div>
                        <div className="truncate">{track.artists.map(a => a.name).join(', ')}</div>
                        <div className="text-xs text-gray-500">{formatDuration(track.duration_ms)}</div>
                      </div>
                    }
                    media={
                      <img 
                        src={track.album.images[2]?.url || track.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'} 
                        alt={track.name}
                        className="w-14 h-14 rounded-lg object-cover"
                      />
                    }
                    after={
                      <div className="flex gap-2">
                        <Button 
                          className="bg-pink-500 text-white min-h-[40px] min-w-[40px] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToFavorites(track)
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="bg-gray-500 text-white min-h-[40px] min-w-[40px] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAddToPlaylist(track)
                          }}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="bg-green-500 text-white min-h-[40px] min-w-[40px] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayTrack(track)
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </List>
            </Block>
          )}

          {/* État vide */}
          {!loading && query && results.length === 0 && !error && (
            <Block>
              <Card className="p-8 text-center">
                <div className="text-4xl mb-4">🤔</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Aucun résultat</h3>
                <p className="text-gray-600">
                  Aucun résultat trouvé pour "{query}"
                </p>
              </Card>
            </Block>
          )}
        </div>

        {/* Actions Sheet - Ajouter à playlist */}
        <Actions opened={showActions} onBackdropClick={() => setShowActions(false)}>
          <ActionsGroup>
            <div className="p-4 text-center border-b border-gray-200">
              <h3 className="font-bold text-gray-900">Ajouter à une playlist</h3>
              {selectedTrack && (
                <p className="text-sm text-gray-600 mt-1">"{selectedTrack.name}"</p>
              )}
            </div>
            {playlists.map(playlist => (
              <ActionsButton
                key={playlist.id}
                onClick={() => handleAddTrackToPlaylist(playlist.id)}
              >
                🎵 {playlist.name}
              </ActionsButton>
            ))}
          </ActionsGroup>
          <ActionsGroup>
            <ActionsButton onClick={() => setShowActions(false)}>
              Annuler
            </ActionsButton>
          </ActionsGroup>
        </Actions>
      </Page>
    </App>
  )
}