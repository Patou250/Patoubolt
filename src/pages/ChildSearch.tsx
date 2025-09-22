import { useState } from 'react'
import { 
  App, Page, Navbar, Block, List, ListItem, Button, Searchbar,
  Actions, ActionsGroup, ActionsButton, Card
} from 'konsta/react'
import { Play, Heart, Plus, Music, Search } from 'lucide-react'
import SpotifySearch from '../components/ui/SpotifySearch'
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
  const [playlists, setPlaylists] = useState<Playlist[]>([])
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

  const handleRequestSpotifyConnection = () => {
    // Cette fonction sera ajoutée si nécessaire dans ChildSearch
    console.log('Request Spotify connection from search page')
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
                <Button className="bg-primary text-white" onClick={handleRequestSpotifyConnection}>
                  Demander à papa/maman
                </Button>
              </Card>
            </Block>
          )}

          {/* Recherche Spotify intégrée */}
          {spotifyConnected && (
            <Block>
              <Card className="p-4">
                <SpotifySearch
                  onTrackSelect={(track) => handlePlayTrack(track)}
                  onAddToPlaylist={(track) => handleAddToPlaylist(track)}
                  onAddToFavorites={(track) => handleToggleFavorite(track)}
                />
              </Card>
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