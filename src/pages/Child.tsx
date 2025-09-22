import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { App, Page, Navbar, Block, Card, Button, List, ListItem, Badge, Actions, ActionsGroup, ActionsButton } from 'konsta/react'
import { Music, Heart, Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import PlayerSdk from '../components/PlayerSdk'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface ChildData {
  id: string
  name: string
  emoji: string
}

interface Track {
  trackId: string
  name: string
  artist: string
  cover: string
  ts: number
}

interface CurrentTrack {
  id: string
  name: string
  artist: string
  cover: string
}

interface Playlist {
  id: string
  title: string
  cover: string
  type: 'favorites' | 'weekly' | 'custom'
}

export default function Child() {
  const [child, setChild] = useState<ChildData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [weeklyPlaylists, setWeeklyPlaylists] = useState<Playlist[]>([])
  const [history, setHistory] = useState<Track[]>([])
  const [showSpotifyAlert, setShowSpotifyAlert] = useState(false)
  const [playerSdkRef, setPlayerSdkRef] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    // Si on accède via /direct/child, créer une session factice
    if (window.location.pathname === '/direct/child') {
      const fakeChild = {
        id: 'test-child-id',
        name: 'Emma',
        emoji: '👧'
      }
      setChild(fakeChild)
      localStorage.setItem('patou_child', JSON.stringify(fakeChild))
    } else {
      // Récupérer les données enfant depuis localStorage
      const childData = localStorage.getItem('patou_child')
      if (childData) {
        setChild(JSON.parse(childData))
      }
    }

    // Vérifier les tokens Spotify
    const tokens = getSpotifyTokens()
    if (tokens) {
      setAccessToken(tokens.access_token)
    }

    // Charger les playlists de la semaine
    loadWeeklyPlaylists()
    
    // Charger l'historique
    loadHistory()

    // Simuler une piste en cours
    setCurrentTrack({
      id: '1',
      name: 'Hakuna Matata',
      artist: 'Le Roi Lion',
      cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'
    })
  }, [])

  const loadWeeklyPlaylists = () => {
    // Simuler des playlists de la semaine
    const mockPlaylists: Playlist[] = [
      {
        id: 'weekly1',
        title: 'Disney Hits',
        cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'weekly'
      },
      {
        id: 'weekly2',
        title: 'Comptines Modernes',
        cover: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'weekly'
      },
      {
        id: 'weekly3',
        title: 'Musiques du Monde',
        cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'weekly'
      },
      {
        id: 'weekly4',
        title: 'Relaxation',
        cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'weekly'
      }
    ]
    setWeeklyPlaylists(mockPlaylists)
  }

  const loadHistory = () => {
    const historyRaw = localStorage.getItem('patou_play_history')
    if (historyRaw) {
      const historyData = JSON.parse(historyRaw)
      setHistory(historyData.slice(0, 10))
    } else {
      // Historique factice pour la démo
      const mockHistory: Track[] = [
        {
          trackId: '1',
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
        },
        {
          trackId: '3',
          name: 'Under the Sea',
          artist: 'La Petite Sirène',
          cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=100',
          ts: Date.now() - 3000000
        }
      ]
      setHistory(mockHistory)
    }
  }

  const handleTrackChange = (trackId: string) => {
    // Callback du PlayerSdk
    console.log('Track changed:', trackId)
  }

  const handleResume = async () => {
    if (!accessToken) {
      setShowSpotifyAlert(true)
      return
    }
    
    if (playerSdkRef) {
      try {
        await playerSdkRef.resume()
        setIsPlaying(true)
      } catch (error) {
        console.error('Erreur resume:', error)
      }
    }
  }

  const handlePlayPause = async () => {
    if (!accessToken) {
      setShowSpotifyAlert(true)
      return
    }
    
    if (playerSdkRef) {
      try {
        await playerSdkRef.togglePlay()
        setIsPlaying(!isPlaying)
      } catch (error) {
        console.error('Erreur play/pause:', error)
      }
    }
  }

  const handlePrevious = async () => {
    if (!accessToken) {
      setShowSpotifyAlert(true)
      return
    }
    
    if (playerSdkRef) {
      try {
        await playerSdkRef.previousTrack()
      } catch (error) {
        console.error('Erreur previous:', error)
      }
    }
  }

  const handleNext = async () => {
    if (!accessToken) {
      setShowSpotifyAlert(true)
      return
    }
    
    if (playerSdkRef) {
      try {
        await playerSdkRef.nextTrack()
      } catch (error) {
        console.error('Erreur next:', error)
      }
    }
  }

  const handleAddToFavorites = () => {
    if (!currentTrack) {
      console.log('Aucune piste courante à ajouter aux favoris')
      return
    }
    
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      
      favs[currentTrack.id] = {
        trackId: currentTrack.id,
        name: currentTrack.name,
        artist: currentTrack.artist,
        cover: currentTrack.cover,
        ts: Date.now()
      }
      
      localStorage.setItem('patou_favorites', JSON.stringify(favs))
      console.log('✅ Ajouté aux favoris:', currentTrack.name)
      
      // TODO: Sync avec Supabase
    } catch (error) {
      console.error('❌ Erreur ajout favoris:', error)
    }
  }

  const handleSpotifyRequest = () => {
    setShowSpotifyAlert(true)
  }

  const handlePlayPlaylist = (playlistId: string) => {
    console.log('Playing playlist:', playlistId)
    // Ici on pourrait démarrer la lecture de la playlist
  }

  const handlePlayTrack = (trackId: string) => {
    console.log('Playing track:', trackId)
    // Ici on pourrait démarrer la lecture du track
  }

  if (!child) {
    return (
      <App theme="ios">
        <Page>
          <Navbar title="Patou Enfant" />
          <Block className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </Block>
        </Page>
      </App>
    )
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Patou Enfant" />
        
        <div className="space-y-4 p-4">
          {/* Section 1: Continue (si piste en cours) */}
          {currentTrack && (
            <Block>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.name}
                    className="w-14 h-14 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">{currentTrack.name}</h3>
                    <p className="text-gray-600 text-xs">{currentTrack.artist}</p>
                  </div>
                  <Button 
                    className="bg-primary text-white min-h-[48px] px-4"
                    onClick={handlePlayPause}
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Reprendre
                  </Button>
                </div>
              </Card>
            </Block>
          )}

          {/* Section 2: Lecteur */}
          <Block>
            <Card className="p-4">
              {accessToken ? (
                <PlayerSdk 
                  accessToken={accessToken} 
                  onTrackChange={handleTrackChange}
                  onPlayerReady={setPlayerSdkRef}
                />
              ) : (
                <div className="text-center py-8">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Lecteur indisponible</h3>
                  <p className="text-gray-600 mb-4">Connexion Spotify requise</p>
                  <Button 
                    className="bg-primary text-white"
                    onClick={handleSpotifyRequest}
                  >
                    Demander à papa/maman
                  </Button>
                </div>
              )}
              
              {/* Boutons d'action sous le player */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Button 
                  className="bg-share text-white min-h-[48px] min-w-[48px] rounded-full"
                  onClick={handleAddToFavorites}
                >
                  <Heart className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button 
                    className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                    onClick={handlePrevious}
                  >
                    <SkipBack className="w-5 h-5" />
                  </Button>
                  <Button 
                    className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                    onClick={handlePlayPause}
                  >
                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                  </Button>
                  <Button 
                    className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                    onClick={handleNext}
                  >
                    <SkipForward className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </Block>

          {/* Section 3: Playlist de la semaine */}
          <Block>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-bold text-gray-700">Playlist de la semaine</h2>
              <Badge className="bg-awaken text-gray-900">Semaine</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-3 pb-4 snap-x" style={{ width: 'max-content' }}>
                {weeklyPlaylists.map(playlist => (
                  <Card 
                    key={playlist.id}
                    className="flex-shrink-0 w-32 cursor-pointer snap-start"
                    onClick={() => handlePlayPlaylist(playlist.id)}
                  >
                    <img 
                      src={playlist.cover} 
                      alt={playlist.title}
                      className="w-full h-24 object-cover rounded-t-lg"
                    />
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-900 text-xs truncate">
                        {playlist.title}
                      </h3>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Block>

          {/* Section 4: Historique */}
          <Block>
            <h2 className="text-xl font-bold text-gray-700 mb-4">Récemment écouté</h2>
            
            {history.length > 0 ? (
              <List strong inset>
                {history.map((track, index) => (
                  <ListItem
                    key={`${track.trackId}-${index}`}
                    title={track.name}
                    subtitle={track.artist}
                    media={
                      <img 
                        src={track.cover} 
                        alt={track.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    }
                    after={
                      <Button 
                        className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                        onClick={() => handlePlayTrack(track.trackId)}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    }
                  />
                ))}
              </List>
            ) : (
              <Card className="p-6 text-center">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun historique</h3>
                <p className="text-gray-600 mb-4">
                  Commence à écouter de la musique pour voir ton historique ici
                </p>
                <Button 
                  className="bg-awaken text-gray-900"
                  onClick={() => navigate('/child/search')}
                >
                  Découvrir de la musique
                </Button>
              </Card>
            )}
          </Block>
        </div>

        {/* Modal d'alerte Spotify */}
        <Actions opened={showSpotifyAlert} onBackdropClick={() => setShowSpotifyAlert(false)}>
          <ActionsGroup>
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">🎵</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Connexion Spotify requise</h3>
              <p className="text-gray-600 mb-4">Tu dois demander à tes parents de connecter Spotify.</p>
              <ActionsButton onClick={() => setShowSpotifyAlert(false)}>
                J'ai compris
              </ActionsButton>
            </div>
          </ActionsGroup>
        </Actions>
      </Page>
    </App>
  )
}