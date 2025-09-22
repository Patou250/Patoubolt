import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Page, Navbar, Block, Card, Button, List, ListItem, Badge } from 'konsta/react'
import { Music, Heart, Play, Search, LogOut, Shuffle, SkipForward, SkipBack, Pause } from 'lucide-react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface ChildData {
  id: string
  name: string
  emoji: string
  parent_id: string
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
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('👶 Child page loading...')
    
    // Vérifier session enfant
    const childData = localStorage.getItem('patou_child_session')
    if (!childData) {
      console.log('❌ No child session found, redirecting to login')
      navigate('/child/login')
      return
    }

    try {
      const parsedChild = JSON.parse(childData)
      console.log('✅ Child session found:', parsedChild.child?.name || parsedChild.name)
      
      // Support both old and new session formats
      if (parsedChild.child) {
        setChild(parsedChild.child)
      } else {
        setChild(parsedChild)
      }
    } catch (error) {
      console.error('❌ Error parsing child session:', error)
      navigate('/child/login')
      return
    }

    // Vérifier tokens Spotify
    const tokens = getSpotifyTokens()
    if (tokens) {
      console.log('✅ Spotify tokens found')
      setAccessToken(tokens.access_token)
    } else {
      console.log('⚠️ No Spotify tokens found')
    }

    // Charger données
    loadWeeklyPlaylists()
    loadHistory()
    loadCurrentTrack()
    
    setLoading(false)
  }, [navigate])

  const loadWeeklyPlaylists = () => {
    console.log('📋 Loading weekly playlists...')
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
      }
    ]
    setWeeklyPlaylists(mockPlaylists)
    console.log('✅ Weekly playlists loaded:', mockPlaylists.length)
  }

  const loadHistory = () => {
    console.log('📜 Loading play history...')
    const historyRaw = localStorage.getItem('patou_play_history')
    if (historyRaw) {
      try {
        const historyData = JSON.parse(historyRaw)
        setHistory(historyData.slice(0, 5))
        console.log('✅ History loaded:', historyData.length, 'tracks')
      } catch (error) {
        console.error('❌ Error parsing history:', error)
        setHistory([])
      }
    } else {
      console.log('📝 No history found, using mock data')
      const mockHistory: Track[] = [
        {
          trackId: '3n3Ppam7vgaVa1iaRUc9Lp',
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
        }
      ]
      setHistory(mockHistory)
    }
  }

  const loadCurrentTrack = () => {
    const lastTrackRaw = localStorage.getItem('patou_last_track')
    if (lastTrackRaw) {
      try {
        const lastTrack = JSON.parse(lastTrackRaw)
        setCurrentTrack({
          id: lastTrack.trackId,
          name: lastTrack.name,
          artist: lastTrack.artist,
          cover: lastTrack.cover
        })
        console.log('✅ Current track loaded:', lastTrack.name)
      } catch (error) {
        console.error('❌ Error parsing current track:', error)
      }
    }
  }

  const handleSpotifyConnect = () => {
    console.log('🔗 Child requesting Spotify connection...')
    alert('Demande à tes parents de connecter Spotify dans leur espace parent !')
  }

  const handlePlayTrack = async (trackId: string) => {
    console.log('▶️ Playing track:', trackId)
    
    if (!accessToken) {
      console.log('❌ No access token for playback')
      handleSpotifyConnect()
      return
    }

    try {
      // Essayer de jouer via l'API Spotify
      const response = await fetch(`https://api.spotify.com/v1/me/player/play`, {
        method: 'PUT',
        headers: { 
          Authorization: `Bearer ${accessToken}`, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ 
          uris: [`spotify:track:${trackId}`] 
        })
      })

      if (response.ok) {
        console.log('✅ Track started successfully')
        setIsPlaying(true)
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

  const handlePlayPlaylist = (playlistId: string) => {
    console.log('📋 Playing playlist:', playlistId)
    // Jouer la première piste de la playlist
    if (playlistId === 'weekly1') {
      handlePlayTrack('3n3Ppam7vgaVa1iaRUc9Lp') // Hakuna Matata
    } else {
      alert('Playlist en cours de développement !')
    }
  }

  const handleAddToFavorites = (track: CurrentTrack | Track) => {
    console.log('❤️ Adding to favorites:', track.name)
    
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      
      const trackId = 'id' in track ? track.id : track.trackId
      
      favs[trackId] = {
        trackId: trackId,
        name: track.name,
        artist: track.artist,
        cover: track.cover,
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

  const handleLogout = () => {
    console.log('👋 Child logout')
    localStorage.removeItem('patou_child_session')
    navigate('/child/login')
  }

  if (loading) {
    return (
      <App theme="ios">
        <Page>
          <Navbar title="Patou" />
          <Block className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement...</p>
          </Block>
        </Page>
      </App>
    )
  }

  if (!child) {
    return (
      <App theme="ios">
        <Page>
          <Navbar title="Erreur" />
          <Block className="text-center py-12">
            <div className="text-4xl mb-4">😕</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Session expirée</h3>
            <p className="text-gray-600 mb-6">Tu dois te reconnecter</p>
            <Button 
              className="bg-yellow-400 text-gray-900"
              onClick={() => navigate('/child/login')}
            >
              Se reconnecter
            </Button>
          </Block>
        </Page>
      </App>
    )
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar 
          title={`Salut ${child.name} ${child.emoji}`}
          right={
            <Button 
              className="text-gray-600 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          }
        />
        
        <div className="space-y-6 p-4 pb-20">
          {/* Section 1: Lecteur principal */}
          <Block>
            <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100">
              {currentTrack ? (
                <div className="text-center">
                  <img 
                    src={currentTrack.cover} 
                    alt={currentTrack.name}
                    className="w-24 h-24 rounded-2xl mx-auto mb-4 shadow-lg"
                  />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{currentTrack.name}</h3>
                  <p className="text-gray-600 text-sm mb-6">{currentTrack.artist}</p>
                  
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Button 
                      className="bg-gray-200 text-gray-700 min-h-[48px] min-w-[48px] rounded-full"
                      onClick={() => console.log('⏮️ Previous track')}
                    >
                      <SkipBack className="w-5 h-5" />
                    </Button>
                    
                    <Button 
                      className="bg-gradient-to-r from-green-400 to-blue-500 text-white min-h-[56px] min-w-[56px] rounded-full shadow-lg"
                      onClick={() => {
                        console.log('⏯️ Play/Pause toggle')
                        if (currentTrack) {
                          handlePlayTrack(currentTrack.id)
                        }
                      }}
                    >
                      {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </Button>
                    
                    <Button 
                      className="bg-gray-200 text-gray-700 min-h-[48px] min-w-[48px] rounded-full"
                      onClick={() => console.log('⏭️ Next track')}
                    >
                      <SkipForward className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <Button 
                    className="bg-pink-500 text-white px-6"
                    onClick={() => handleAddToFavorites(currentTrack)}
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    Ajouter aux favoris
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🎵</div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Aucune musique</h3>
                  <p className="text-gray-600 mb-6">Commence par chercher une chanson !</p>
                  <Button 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6"
                    onClick={() => navigate('/child/search')}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Rechercher
                  </Button>
                </div>
              )}
            </Card>
          </Block>

          {/* Section 2: Playlists de la semaine */}
          <Block>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">🎵 Cette semaine</h2>
              <Badge className="bg-yellow-400 text-gray-900 px-3 py-1">Nouveau</Badge>
            </div>
            
            <div className="overflow-x-auto">
              <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
                {weeklyPlaylists.map(playlist => (
                  <Card 
                    key={playlist.id}
                    className="flex-shrink-0 w-36 cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      console.log('📋 Playlist clicked:', playlist.title)
                      handlePlayPlaylist(playlist.id)
                    }}
                  >
                    <img 
                      src={playlist.cover} 
                      alt={playlist.title}
                      className="w-full h-28 object-cover rounded-t-xl"
                    />
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm truncate">
                        {playlist.title}
                      </h3>
                      <p className="text-gray-600 text-xs">Playlist</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Block>

          {/* Section 3: Historique récent */}
          <Block>
            <h2 className="text-xl font-bold text-gray-800 mb-4">🕐 Récemment écouté</h2>
            
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
                      <div className="flex gap-2">
                        <Button 
                          className="bg-pink-500 text-white min-h-[40px] min-w-[40px] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('❤️ Adding to favorites from history:', track.name)
                            handleAddToFavorites(track)
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button 
                          className="bg-green-500 text-white min-h-[40px] min-w-[40px] rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('▶️ Playing from history:', track.name)
                            handlePlayTrack(track.trackId)
                          }}
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    }
                  />
                ))}
              </List>
            ) : (
              <Card className="p-6 text-center">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800 mb-2">Aucun historique</h3>
                <p className="text-gray-600 mb-6">
                  Commence à écouter de la musique pour voir ton historique ici
                </p>
                <Button 
                  className="bg-yellow-400 text-gray-900 px-6"
                  onClick={() => {
                    console.log('🔍 Navigate to search from empty history')
                    navigate('/child/search')
                  }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Découvrir
                </Button>
              </Card>
            )}
          </Block>

          {/* Section 4: Actions rapides */}
          <Block>
            <h2 className="text-xl font-bold text-gray-800 mb-4">🚀 Actions rapides</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className="p-4 text-center cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-blue-100 to-purple-100"
                onClick={() => {
                  console.log('❤️ Navigate to favorites')
                  navigate('/child/favorites')
                }}
              >
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 text-sm">Mes favoris</h3>
                <p className="text-gray-600 text-xs">Tes chansons préférées</p>
              </Card>
              
              <Card 
                className="p-4 text-center cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br from-green-100 to-blue-100"
                onClick={() => {
                  console.log('🔍 Navigate to search')
                  navigate('/child/search')
                }}
              >
                <Search className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <h3 className="font-bold text-gray-900 text-sm">Rechercher</h3>
                <p className="text-gray-600 text-xs">Trouve de nouvelles chansons</p>
              </Card>
            </div>
          </Block>

          {/* Section 5: État Spotify */}
          {!accessToken && (
            <Block>
              <Card className="p-6 text-center bg-gradient-to-br from-orange-100 to-red-100">
                <div className="text-4xl mb-4">🔌</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Spotify non connecté
                </h3>
                <p className="text-gray-600 mb-4">
                  Demande à tes parents de connecter Spotify pour écouter de la musique
                </p>
                <Button 
                  className="bg-orange-500 text-white px-6"
                  onClick={handleSpotifyConnect}
                >
                  Demander à papa/maman
                </Button>
              </Card>
            </Block>
          )}
        </div>
      </Page>
    </App>
  )
}