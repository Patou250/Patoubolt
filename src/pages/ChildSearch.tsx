import { useState } from 'react'
import { 
  App, Page, Navbar, Block, List, ListItem, Button, Searchbar,
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
}

type Playlist = {
  id: string
  name: string
}

export default function ChildSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Track[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showActions, setShowActions] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [spotifyConnected, setSpotifyConnected] = useState(true)

  const loadPlaylists = () => {
    // Simuler le chargement des playlists de l'enfant
    const mockPlaylists: Playlist[] = [
      { id: '1', name: 'Mes Disney préférés' },
      { id: '2', name: 'Comptines du soir' },
      { id: '3', name: 'Musiques de films' }
    ]
    setPlaylists(mockPlaylists)
  }

  const doSearch = async () => {
    if (!query.trim()) return
    
    setErr(null)
    setLoading(true)
    
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) {
        setSpotifyConnected(false)
        throw new Error('Connexion Spotify requise')
      }

      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`, {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      })
      
      if (!res.ok) {
        if (res.status === 401 || res.status === 502) {
          setSpotifyConnected(false)
          throw new Error('Connexion Spotify expirée')
        }
        throw new Error('Erreur de recherche')
      }
      
      const data = await res.json()
      setResults(data.tracks.items || [])
      setSpotifyConnected(true)
    } catch (e: any) {
      setErr(e.message)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = async (track: Track) => {
    try {
      const tokens = getSpotifyTokens()
      if (!tokens) {
        throw new Error('Connexion Spotify requise')
      }
      
      // Lecture immédiate via me/player/play
      await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${tokens.access_token}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ uris: [`spotify:track:${track.id}`] })
      })
      
      console.log('Lecture immédiate:', track.name)
    } catch (e: any) {
      console.error('Impossible de jouer ce titre:', e.message)
    }
  }

  const handleToggleFavorite = (track: Track) => {
    const favsRaw = localStorage.getItem('patou_favorites')
    const favs = favsRaw ? JSON.parse(favsRaw) : {}
    
    if (favs[track.id]) {
      // Retirer des favoris
      delete favs[track.id]
      console.log('Retiré des favoris:', track.name)
    } else {
      // Ajouter aux favoris
      favs[track.id] = {
        trackId: track.id,
        name: track.name,
        artist: track.artists.map(a => a.name).join(', '),
        cover: track.album.images?.[0]?.url || '',
        ts: Date.now()
      }
      console.log('Ajouté aux favoris:', track.name)
    }
    
    localStorage.setItem('patou_favorites', JSON.stringify(favs))
    // TODO: Sync avec Supabase
  }

  const handleAddToPlaylist = (track: Track) => {
    setSelectedTrack(track)
    loadPlaylists()
    setShowActions(true)
  }

  const handleAddTrackToPlaylist = (playlistId: string) => {
    if (selectedTrack) {
      console.log(`Ajout de "${selectedTrack.name}" à la playlist ${playlistId}`)
      // TODO: Ajouter à la playlist via Supabase
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
        
        <div className="space-y-4 p-4">
          {/* Barre de recherche */}
          <Block>
            <Searchbar
              placeholder="Chanson, artiste…"
              value={query}
              onInput={(e) => setQuery(e.target.value)}
              onSubmit={doSearch}
              onSearchbarSearch={doSearch}
              disabled={loading}
            />
          </Block>

          {/* État non connecté */}
          {!spotifyConnected && (
            <Block>
              <Card className="p-6 text-center">
                <div className="text-4xl mb-4">🔌</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Connexion Spotify requise
                </h3>
                <p className="text-gray-600 mb-4">
                  Demande à tes parents de connecter Spotify pour rechercher de la musique
                </p>
                <Button className="bg-primary text-white">
                  Demander à papa/maman
                </Button>
              </Card>
            </Block>
          )}

          {/* Message d'erreur */}
          {err && spotifyConnected && (
            <Block>
              <Card className="p-4 bg-red-50 border border-red-200">
                <p className="text-red-700 text-sm">{err}</p>
              </Card>
            </Block>
          )}

          {/* Loading */}
          {loading && (
            <Block className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Recherche en cours...</p>
            </Block>
          )}

          {/* Résultats */}
          {results.length > 0 && (
            <Block>
              <h2 className="text-xl font-bold text-gray-700 mb-4">
                {results.length} résultat{results.length > 1 ? 's' : ''}
              </h2>
              
              <List mediaList>
                {results.map(track => (
                  <ListItem
                    key={track.id}
                    title={track.name}
                    text={track.artists.map(a => a.name).join(', ')}
                    media={
                      <img
                        src={track.album.images?.[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'}
                        alt={track.album.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    }
                    after={
                      <div className="flex items-center gap-2">
                        <Button 
                          className="bg-share text-white min-h-[48px] min-w-[48px] rounded-full"
                          onClick={() => handleToggleFavorite(track)}
                          title="Ajouter aux favoris"
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="bg-gray-100 text-gray-700 min-h-[48px] min-w-[48px] rounded-full"
                          onClick={() => handleAddToPlaylist(track)}
                          title="Ajouter à une playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                          onClick={() => handlePlayTrack(track)}
                          title="Écouter"
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

          {/* Empty state - aucun résultat */}
          {!loading && query && results.length === 0 && !err && spotifyConnected && (
            <Block className="text-center py-12">
              <div className="text-6xl mb-4">🤔</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun résultat</h3>
              <p className="text-gray-600">
                Essaie avec d'autres mots-clés pour "{query}"
              </p>
            </Block>
          )}

          {/* Empty state - query vide */}
          {!query && results.length === 0 && !loading && spotifyConnected && (
            <Block className="text-center py-12">
              <div className="text-6xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Prêt à découvrir ?</h3>
              <p className="text-gray-600">
                Tape le nom d'une chanson ou d'un artiste pour commencer
              </p>
            </Block>
          )}
        </div>

        {/* Actions Sheet - Ajouter à playlist */}
        <Actions opened={showActions} onBackdropClick={() => setShowActions(false)}>
          <ActionsGroup>
            <div className="p-4 text-center border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Ajouter à une playlist</h3>
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