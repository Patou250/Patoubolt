import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  App, Page, Navbar, Block, List, ListItem, Button, Popup, 
  Card, Toolbar 
} from 'konsta/react'
import { 
  Music, Play, Heart, Plus, ChevronRight, MoreVertical, 
  Shuffle, Edit2, Trash2 
} from 'lucide-react'

interface Playlist {
  id: string
  name: string
  cover?: string
  trackCount: number
  createdAt: string
}

interface PlaylistTrack {
  id: string
  name: string
  artist: string
  cover: string
  duration: string
}

export default function ChildPlaylists() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [currentPlaylist, setCurrentPlaylist] = useState<Playlist | null>(null)
  const [playlistTracks, setPlaylistTracks] = useState<PlaylistTrack[]>([])
  const [showNewPlaylistModal, setShowNewPlaylistModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadPlaylistDetail(id)
    } else {
      loadPlaylists()
    }
  }, [id])

  const loadPlaylists = () => {
    // Simuler le chargement des playlists depuis localStorage ou Supabase
    const mockPlaylists: Playlist[] = [
      {
        id: '1',
        name: 'Mes Disney préférés',
        trackCount: 12,
        createdAt: '2024-01-15'
      },
      {
        id: '2', 
        name: 'Comptines du soir',
        trackCount: 8,
        createdAt: '2024-01-10'
      },
      {
        id: '3',
        name: 'Musiques de films',
        trackCount: 15,
        createdAt: '2024-01-05'
      }
    ]
    setPlaylists(mockPlaylists)
    setLoading(false)
  }

  const loadPlaylistDetail = (playlistId: string) => {
    // Simuler le chargement du détail d'une playlist
    const mockPlaylist: Playlist = {
      id: playlistId,
      name: 'Mes Disney préférés',
      trackCount: 12,
      createdAt: '2024-01-15'
    }

    const mockTracks: PlaylistTrack[] = [
      {
        id: '1',
        name: 'Hakuna Matata',
        artist: 'Le Roi Lion',
        cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
        duration: '3:45'
      },
      {
        id: '2',
        name: 'Let It Go',
        artist: 'La Reine des Neiges',
        cover: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=100',
        duration: '3:44'
      },
      {
        id: '3',
        name: 'Under the Sea',
        artist: 'La Petite Sirène',
        cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=100',
        duration: '3:15'
      }
    ]

    setCurrentPlaylist(mockPlaylist)
    setPlaylistTracks(mockTracks)
    setLoading(false)
  }

  const handleCreatePlaylist = () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      trackCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }

    setPlaylists([newPlaylist, ...playlists])
    setNewPlaylistName('')
    setShowNewPlaylistModal(false)

    // TODO: Sauvegarder en base de données (Supabase)
    console.log('Nouvelle playlist créée:', newPlaylist)
  }

  const handlePlayPlaylist = () => {
    if (currentPlaylist) {
      console.log('Lecture playlist:', currentPlaylist.id)
      // TODO: Envoyer au PlayerSdk
    }
  }

  const handlePlayTrack = (trackId: string) => {
    console.log('Lecture piste:', trackId)
    // TODO: Envoyer au PlayerSdk
  }

  const handleToggleFavorite = (trackId: string) => {
    console.log('Toggle favori:', trackId)
    // TODO: Gérer les favoris
  }

  const handleShufflePlaylist = () => {
    if (currentPlaylist) {
      console.log('Lecture aléatoire playlist:', currentPlaylist.id)
      // TODO: Mélanger et envoyer au PlayerSdk
    }
  }

  if (loading) {
    return (
      <App theme="ios">
        <Page>
          <Navbar title={id ? "Playlist" : "Mes playlists"} />
          <Block className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </Block>
        </Page>
      </App>
    )
  }

  // Vue détail d'une playlist
  if (id && currentPlaylist) {
    return (
      <App theme="ios">
        <Page>
          <Navbar 
            title={currentPlaylist.name}
            left={
              <Button 
                className="text-primary"
                onClick={() => navigate('/child/playlists')}
              >
                ← Retour
              </Button>
            }
            right={
              <Button className="text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </Button>
            }
          />
          
          <div className="space-y-4 p-4">
            {/* Header playlist */}
            <Block>
              <Card className="p-4 text-center">
                <div className="text-4xl mb-3">🎵</div>
                <h2 className="text-xl font-bold text-gray-700 mb-2">
                  {currentPlaylist.name}
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  {currentPlaylist.trackCount} titre{currentPlaylist.trackCount > 1 ? 's' : ''}
                </p>
                
                <div className="flex items-center justify-center gap-3">
                  <Button 
                    className="bg-primary text-white px-6"
                    onClick={handlePlayPlaylist}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Lire la playlist
                  </Button>
                  <Button 
                    className="bg-awaken text-gray-900"
                    onClick={handleShufflePlaylist}
                  >
                    <Shuffle className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </Block>

            {/* Liste des titres */}
            <Block>
              <h3 className="text-lg font-bold text-gray-700 mb-3">Titres</h3>
              
              {playlistTracks.length === 0 ? (
                <Card className="p-6 text-center">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Playlist vide
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Ajoutez des titres à cette playlist depuis la recherche
                  </p>
                  <Button 
                    className="bg-primary text-white"
                    onClick={() => navigate('/child/search')}
                  >
                    Rechercher de la musique
                  </Button>
                </Card>
              ) : (
                <List mediaList>
                  {playlistTracks.map((track, index) => (
                    <ListItem
                      key={track.id}
                      title={track.name}
                      text={track.artist}
                      media={
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400 text-sm w-6 text-center">
                            {index + 1}
                          </span>
                          <img 
                            src={track.cover} 
                            alt={track.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        </div>
                      }
                      after={
                        <div className="flex items-center gap-2">
                          <Button 
                            className="bg-share text-white min-h-[48px] min-w-[48px] rounded-full"
                            onClick={() => handleToggleFavorite(track.id)}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button 
                            className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                            onClick={() => handlePlayTrack(track.id)}
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      }
                    />
                  ))}
                </List>
              )}
            </Block>
          </div>
        </Page>
      </App>
    )
  }

  // Vue liste des playlists
  return (
    <App theme="ios">
      <Page>
        <Navbar 
          title="Mes playlists"
          right={
            <Button 
              className="bg-awaken text-gray-900 text-sm px-3 py-1"
              onClick={() => setShowNewPlaylistModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Nouvelle
            </Button>
          }
        />
        
        <div className="space-y-4 p-4">
          {playlists.length === 0 ? (
            // Empty state
            <Block className="text-center py-12">
              <div className="text-6xl mb-6">🎵</div>
              <h3 className="text-xl font-bold text-gray-700 mb-3">
                Aucune playlist
              </h3>
              <p className="text-gray-600 mb-6 px-4">
                Créez votre première playlist pour organiser vos musiques préférées
              </p>
              <Button 
                className="bg-awaken text-gray-900"
                onClick={() => setShowNewPlaylistModal(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer une playlist
              </Button>
            </Block>
          ) : (
            // Liste des playlists
            <Block>
              <List inset>
                {playlists.map((playlist) => (
                  <ListItem
                    key={playlist.id}
                    title={playlist.name}
                    text={`${playlist.trackCount} titre${playlist.trackCount > 1 ? 's' : ''}`}
                    media={
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-protect rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-white" />
                      </div>
                    }
                    after={<ChevronRight className="w-5 h-5 text-gray-400" />}
                    onClick={() => navigate(`/child/playlists/${playlist.id}`)}
                  />
                ))}
              </List>
            </Block>
          )}
        </div>

        {/* Modal nouvelle playlist */}
        <Popup 
          opened={showNewPlaylistModal} 
          onBackdropClick={() => setShowNewPlaylistModal(false)}
        >
          <Page>
            <Navbar 
              title="Nouvelle playlist"
              left={
                <Button 
                  className="text-gray-600"
                  onClick={() => setShowNewPlaylistModal(false)}
                >
                  Annuler
                </Button>
              }
              right={
                <Button 
                  className="text-awaken font-semibold"
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                >
                  Créer
                </Button>
              }
            />
            
            <Block className="space-y-6 p-4">
              <div className="text-center">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Créer une playlist
                </h3>
                <p className="text-gray-600 text-sm">
                  Donnez un nom à votre nouvelle playlist
                </p>
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Nom de la playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="input w-full"
                  autoFocus
                />
              </div>
            </Block>
          </Page>
        </Popup>
      </Page>
    </App>
  )
}