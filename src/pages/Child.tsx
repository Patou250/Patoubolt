import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, Heart, Clock, LogOut, Play, Info, SkipForward, SkipBack, Pause, Volume2, Shuffle, Repeat } from 'lucide-react'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { FavoritesApi } from '../utils/favorites-api'

interface ChildSession {
  child: {
    id: string
    name: string
    emoji: string
    parent_id: string
  }
}

interface Favorite {
  id: string
  track_id: string
  created_at: string
  track_info?: {
    name: string
    artists: { name: string }[]
    album: { images: { url: string }[] }
  }
}

interface PlayHistory {
  id: string
  track_id: string
  started_at: string
  duration_sec: number
}

interface CurrentTrack {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
}

export default function Child() {
  const navigate = useNavigate()
  const [childSession, setChildSession] = useState<ChildSession | null>(null)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [playHistory, setPlayHistory] = useState<PlayHistory[]>([])
  const [currentTrack, setCurrentTrack] = useState<CurrentTrack | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [deviceId, setDeviceId] = useState<string>('')
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkChildSession()
    loadFavorites()
    loadPlayHistory()
    loadSpotifyToken()
  }, [])

  useEffect(() => {
    if (accessToken) {
      initializeSpotifyPlayer()
    }
  }, [accessToken])

  const checkChildSession = () => {
    try {
      const sessionData = localStorage.getItem('child_session')
      if (!sessionData) {
        navigate('/child/login')
        return
      }

      const session = JSON.parse(sessionData) as ChildSession
      if (!session.child || !session.child.id) {
        navigate('/child/login')
        return
      }

      setChildSession(session)
    } catch (error) {
      console.error('Invalid child session:', error)
      navigate('/child/login')
    } finally {
      setLoading(false)
    }
  }

  const loadSpotifyToken = async () => {
    try {
      const tokens = getSpotifyTokens()
      if (tokens && tokens.access_token) {
        setAccessToken(tokens.access_token)
      } else {
        // Try to refresh token
        const response = await fetch('/.netlify/functions/spotify-refresh', {
          method: 'POST',
          credentials: 'include'
        })
        if (response.ok) {
          const data = await response.json()
          setAccessToken(data.access_token)
        }
      }
    } catch (error) {
      console.error('Failed to load Spotify token:', error)
    }
  }

  const initializeSpotifyPlayer = () => {
    if (!window.Spotify || !accessToken) return

    const player = new window.Spotify.Player({
      name: 'Patou Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken)
      },
      volume: volume / 100
    })

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id)
      setDeviceId(device_id)
    })

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return

      setIsPlaying(!state.paused)
      setPosition(state.position)
      setDuration(state.duration)
      
      if (state.track_window?.current_track) {
        setCurrentTrack(state.track_window.current_track)
      }
    })

    player.connect()
  }

  const loadFavorites = () => {
    if (!childSession) return

    const mockFavorites: Favorite[] = [
      {
        id: '1',
        track_id: 'track1',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        track_info: {
          name: 'Let It Go',
          artists: [{ name: 'Idina Menzel' }],
          album: { images: [{ url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300' }] }
        }
      },
      {
        id: '2',
        track_id: 'track2',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        track_info: {
          name: 'Happy',
          artists: [{ name: 'Pharrell Williams' }],
          album: { images: [{ url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300' }] }
        }
      },
      {
        id: '3',
        track_id: 'track3',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
        track_info: {
          name: 'Can\'t Stop the Feeling!',
          artists: [{ name: 'Justin Timberlake' }],
          album: { images: [{ url: 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=300' }] }
        }
      }
    ]
    setFavorites(mockFavorites)
  }

  const loadPlayHistory = () => {
    if (!childSession) return

    const mockHistory: PlayHistory[] = [
      {
        id: '1',
        track_id: 'track1',
        started_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        duration_sec: 180
      },
      {
        id: '2',
        track_id: 'track2',
        started_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        duration_sec: 240
      }
    ]
    setPlayHistory(mockHistory)
  }

  const handlePlayPause = async () => {
    if (!accessToken || !deviceId) return

    try {
      const endpoint = isPlaying ? 'pause' : 'play'
      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error) {
      console.error('Play/pause error:', error)
    }
  }

  const handleNext = async () => {
    if (!accessToken) return

    try {
      await fetch('https://api.spotify.com/v1/me/player/next', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error) {
      console.error('Next track error:', error)
    }
  }

  const handlePrevious = async () => {
    if (!accessToken) return

    try {
      await fetch('https://api.spotify.com/v1/me/player/previous', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error) {
      console.error('Previous track error:', error)
    }
  }

  const toggleFavorite = async (trackId: string) => {
    if (!childSession) return

    try {
      const isFavorited = favorites.some(fav => fav.track_id === trackId)
      
      if (isFavorited) {
        setFavorites(favorites.filter(fav => fav.track_id !== trackId))
      } else {
        const newFavorite: Favorite = {
          id: Date.now().toString(),
          track_id: trackId,
          created_at: new Date().toISOString(),
          track_info: currentTrack ? {
            name: currentTrack.name,
            artists: currentTrack.artists,
            album: currentTrack.album
          } : undefined
        }
        setFavorites([newFavorite, ...favorites])
      }
    } catch (error) {
      console.error('Toggle favorite error:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('child_session')
    navigate('/child/login')
  }

  const formatTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Il y a moins d\'1h'
    if (diffInHours < 24) return `Il y a ${diffInHours}h`
    const diffInDays = Math.floor(diffInHours / 24)
    return `Il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement...
          </h2>
          <p className="text-gray-600">
            Préparation de ton espace
          </p>
        </div>
      </div>
    )
  }

  if (!childSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Session expirée
          </h2>
          <p className="text-gray-600 mb-6">
            Veuillez vous reconnecter
          </p>
          <button
            onClick={() => navigate('/child/login')}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl">{childSession.child.emoji}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Salut {childSession.child.name} ! 👋
                </h1>
                <p className="text-gray-600">Profite de ta musique préférée</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Lecteur Spotify intégré */}
        <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-6 mb-6">
          {currentTrack ? (
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={currentTrack.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'}
                alt={currentTrack.album.name}
                className="w-16 h-16 rounded-lg shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{currentTrack.name}</h3>
                <p className="text-gray-300">{currentTrack.artists.map(a => a.name).join(', ')}</p>
                <p className="text-gray-400 text-sm">{currentTrack.album.name}</p>
              </div>
              <button 
                onClick={() => toggleFavorite(currentTrack.id)}
                className={`p-2 rounded-full transition-colors ${
                  favorites.some(fav => fav.track_id === currentTrack.id)
                    ? 'text-red-500 hover:text-red-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Heart className="w-6 h-6" fill={favorites.some(fav => fav.track_id === currentTrack.id) ? 'currentColor' : 'none'} />
              </button>
            </div>
          ) : (
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-white" />
              </div>
              <p className="text-gray-400 mb-4">Aucune musique en cours</p>
            </div>
          )}

          {/* Barre de progression */}
          {currentTrack && (
            <div className="mb-6">
              <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                <span>{formatTime(position)}</span>
                <div className="flex-1 bg-gray-700 rounded-full h-1">
                  <div
                    className="bg-green-500 h-1 rounded-full transition-all duration-300"
                    style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
                  />
                </div>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}

          {/* Contrôles de lecture */}
          <div className="flex items-center justify-center space-x-6 mb-6">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Shuffle className="w-5 h-5" />
            </button>
            
            <button
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-6 h-6" />
            </button>
            
            <button
              onClick={handlePlayPause}
              className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-colors"
            >
              {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
            </button>
            
            <button
              onClick={handleNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
            
            <button className="text-gray-400 hover:text-white transition-colors">
              <Repeat className="w-5 h-5" />
            </button>
          </div>

          {/* Contrôle du volume */}
          <div className="flex items-center space-x-3">
            <Volume2 className="w-5 h-5 text-gray-400" />
            <div className="flex-1 max-w-32">
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(e) => setVolume(parseInt(e.target.value))}
                className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <span className="text-sm text-gray-400 w-8">{volume}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historique d'écoute */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-900">Historique récent</h2>
            </div>
            
            {playHistory.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aucun historique pour le moment
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Tes écoutes apparaîtront ici !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {playHistory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">Chanson écoutée</h4>
                      <p className="text-sm text-gray-600">{Math.floor(item.duration_sec / 60)} min d'écoute</p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatTimeAgo(item.started_at)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Favoris récents */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="w-6 h-6 text-red-500" />
              <h2 className="text-xl font-bold text-gray-900">Mes favoris récents</h2>
            </div>
            
            {favorites.length === 0 ? (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  Aucun favori pour le moment
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Utilise le lecteur pour ajouter tes chansons préférées !
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((favorite) => (
                  <div key={favorite.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    {favorite.track_info?.album.images[0] && (
                      <img
                        src={favorite.track_info.album.images[0].url}
                        alt="Album cover"
                        className="w-12 h-12 rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {favorite.track_info?.name || 'Chanson inconnue'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {favorite.track_info?.artists.map(a => a.name).join(', ') || 'Artiste inconnu'}
                      </p>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span className="ml-1">{formatTimeAgo(favorite.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats amusantes */}
        <div className="mt-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
          <h3 className="text-lg font-bold mb-4">🎵 Tes stats du jour</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{playHistory.length}</div>
              <div className="text-sm opacity-90">Chansons écoutées</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.floor(playHistory.reduce((acc, item) => acc + item.duration_sec, 0) / 60)}
              </div>
              <div className="text-sm opacity-90">Minutes d'écoute</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{favorites.length}</div>
              <div className="text-sm opacity-90">Favoris</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">🎉</div>
              <div className="text-sm opacity-90">Bonne humeur</div>
            </div>
          </div>
        </div>
      </div>

      {/* Script Spotify SDK */}
      <script src="https://sdk.scdn.co/spotify-player.js"></script>
      <script>
        {`
          window.onSpotifyWebPlaybackSDKReady = () => {
            console.log('Spotify Web Playback SDK is ready');
          };
        `}
      </script>
    </div>
  )
}