import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Music, Users, Settings, BarChart3, Shield, Calendar, Plus, LogOut,
  Play, Pause, SkipForward, SkipBack, Volume2, Heart, Ban, X
} from 'lucide-react'
import { getParentSession, clearParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'

interface SpotifyPlayerState {
  isPlaying: boolean
  currentTrack: any
  position: number
  duration: number
}

interface Playlist {
  id: string
  name: string
  description?: string
  tracks: string[]
  created_at: string
}

interface ExcludedTrack {
  id: string
  spotify_id: string
  name: string
  artist: string
  excluded_at: string
  reason?: string
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0
  })
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false)
  const [showAssociateChildModal, setShowAssociateChildModal] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('')
  const [childIdentifier, setChildIdentifier] = useState('')
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [excludedTracks, setExcludedTracks] = useState<ExcludedTrack[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    // Si on accède via /direct/parent, créer une session factice
    if (window.location.pathname === '/direct/parent') {
      const fakeSession = {
        parent: {
          id: 'test-parent-id',
          email: 'test@patou.app',
          spotify_id: 'test-spotify-id'
        },
        timestamp: Date.now()
      }
      localStorage.setItem('patou_parent_session', JSON.stringify(fakeSession))
      checkSpotifyConnection()
      setIsLoading(false)
      return
    }

    const tokens = getSpotifyTokens()
    
    // Si on a des tokens Spotify, créer une session
    if (tokens) {
      fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      })
      .then(res => res.json())
      .then(user => {
        const parentSession = {
          parent: {
            id: user.id,
            email: user.email,
            spotify_id: user.id
          },
          timestamp: Date.now()
        }
        localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
        checkSpotifyConnection()
        loadChildren(parentSession) 
        initializeSpotifyPlayer()
      })
      .catch(() => {
        navigate('/')
      })
      return
    }
    
    // Vérifier s'il y a une session parent
    const session = getParentSession()
    if (!session && !tokens) {
      navigate('/login-parent')
      return
    }

    if (session) {
      checkSpotifyConnection()
      loadChildren(session)
      initializeSpotifyPlayer()
      loadPlaylists()
      loadExcludedTracks()
    }
  }, [navigate])

  const checkSpotifyConnection = () => {
    const tokens = getSpotifyTokens()
    setSpotifyConnected(!!tokens)
    if (tokens) {
      setAccessToken(tokens.access_token)
    }
  }

  const initializeSpotifyPlayer = () => {
    if (!window.Spotify) {
      const script = document.createElement('script')
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)
      
      window.onSpotifyWebPlaybackSDKReady = () => {
        setupPlayer()
      }
    } else {
      setupPlayer()
    }
  }

  const setupPlayer = () => {
    if (!accessToken) return

    const player = new window.Spotify.Player({
      name: 'Patou Parent Player',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(accessToken)
      },
      volume: 0.5
    })

    player.addListener('ready', ({ device_id }: { device_id: string }) => {
      setDeviceId(device_id)
    })

    player.addListener('player_state_changed', (state: any) => {
      if (!state) return
      
      setPlayerState({
        isPlaying: !state.paused,
        currentTrack: state.track_window?.current_track,
        position: state.position,
        duration: state.duration
      })
    })

    player.connect()
  }

  const loadChildren = async (session: any) => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: session.parent.email,
            full_name: session.parent.display_name || session.parent.email
          })
          .select('id')
          .single()
        
        if (createError) {
          return
        }
        
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', newProfile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        setChildren(data || [])
      } else {
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', profile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        setChildren(data || [])
      }
    } catch (error) {
      console.error('Failed to load children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadPlaylists = () => {
    const playlistsRaw = localStorage.getItem('patou_parent_playlists')
    if (playlistsRaw) {
      setPlaylists(JSON.parse(playlistsRaw))
    } else {
      const mockPlaylists: Playlist[] = [
        {
          id: '1',
          name: 'Playlist Familiale',
          description: 'Musiques pour toute la famille',
          tracks: ['track1', 'track2'],
          created_at: new Date().toISOString()
        }
      ]
      setPlaylists(mockPlaylists)
    }
  }

  const loadExcludedTracks = () => {
    const excludedRaw = localStorage.getItem('patou_excluded_tracks')
    if (excludedRaw) {
      setExcludedTracks(JSON.parse(excludedRaw))
    } else {
      const mockExcluded: ExcludedTrack[] = []
      setExcludedTracks(mockExcluded)
    }
  }

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) return

    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      description: newPlaylistDescription.trim(),
      tracks: [],
      created_at: new Date().toISOString()
    }

    const updatedPlaylists = [...playlists, newPlaylist]
    setPlaylists(updatedPlaylists)
    localStorage.setItem('patou_parent_playlists', JSON.stringify(updatedPlaylists))

    setNewPlaylistName('')
    setNewPlaylistDescription('')
    setShowCreatePlaylistModal(false)
  }

  const handleAssociateChild = async () => {
    if (!childIdentifier.trim()) return

    try {
      const { data: childData, error } = await supabase
        .from('children')
        .select('*')
        .eq('id', childIdentifier.trim())
        .single()

      if (error || !childData) {
        alert('Enfant non trouvé avec cet identifiant')
        return
      }

      const isAlreadyAssociated = children.some(child => child.id === childData.id)
      if (isAlreadyAssociated) {
        alert('Cet enfant est déjà associé à votre compte')
        return
      }

      setChildren([...children, childData])
      setChildIdentifier('')
      setShowAssociateChildModal(false)
    } catch (error) {
      alert('Erreur lors de l\'association de l\'enfant')
    }
  }

  const handleExcludeTrack = (track: any) => {
    if (!track) return

    const excludedTrack: ExcludedTrack = {
      id: Date.now().toString(),
      spotify_id: track.id,
      name: track.name,
      artist: track.artists?.map((a: any) => a.name).join(', ') || 'Artiste inconnu',
      excluded_at: new Date().toISOString(),
      reason: 'Exclu par le parent'
    }

    const updatedExcluded = [...excludedTracks, excludedTrack]
    setExcludedTracks(updatedExcluded)
    localStorage.setItem('patou_excluded_tracks', JSON.stringify(updatedExcluded))
  }

  const handleReintegrateTrack = (excludedTrack: ExcludedTrack) => {
    const updatedExcluded = excludedTracks.filter(track => track.id !== excludedTrack.id)
    setExcludedTracks(updatedExcluded)
    localStorage.setItem('patou_excluded_tracks', JSON.stringify(updatedExcluded))
  }

  const handleSpotifyControl = async (action: 'play' | 'pause' | 'next' | 'previous') => {
    if (!accessToken) return

    try {
      let endpoint = ''
      let method = 'PUT'

      switch (action) {
        case 'play':
          endpoint = 'play'
          break
        case 'pause':
          endpoint = 'pause'
          break
        case 'next':
          endpoint = 'next'
          method = 'POST'
          break
        case 'previous':
          endpoint = 'previous'
          method = 'POST'
          break
      }

      await fetch(`https://api.spotify.com/v1/me/player/${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
    } catch (error) {
      console.error('Spotify control error:', error)
    }
  }

  const connectSpotify = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/parent/callback`
    
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-library-modify',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('spotify_auth_state', state)

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true&` +
      `state=${state}`

    window.location.href = authUrl
  }

  const handleSignOut = () => {
    clearParentSession()
    navigate('/login-parent')
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/patou-logo.svg" alt="Patou" className="h-8" />
              <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Connexion Spotify */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Connecter Spotify</h3>
                <p className="text-sm text-gray-600">
                  Accédez à votre bibliothèque musicale et créez des playlists personnalisées pour vos enfants
                </p>
              </div>
            </div>
            {!spotifyConnected ? (
              <button
                onClick={connectSpotify}
                className="px-6 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
              >
                Connecter
              </button>
            ) : (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium">
                Connecté
              </div>
            )}
          </div>
        </div>

        {/* Sections principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Enfants */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Enfants</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Gérez les profils de vos enfants et leurs préférences musicales
            </p>
            <button
              onClick={() => navigate('/parent/children')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Voir les profils
            </button>
          </div>

          {/* Playlists enfants */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                <Music className="w-5 h-5 text-pink-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Playlists enfants</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Explorez et gérez les playlists adaptées à vos enfants
            </p>
            <button
              onClick={() => navigate('/parent/curation')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Voir les playlists
            </button>
          </div>

          {/* Règles & Filtres */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Règles & Filtres</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Configurez les filtres de contrôle et les règles d'écoute
            </p>
            <div className="mb-4">
              <div className="text-xs text-gray-500 mb-1">Niveau de vigilance</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '80%' }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">80%</div>
            </div>
            <button
              onClick={() => navigate('/parent-settings')}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Configurer
            </button>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => setShowCreatePlaylistModal(true)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <Plus className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-gray-900">Créer une playlist</h3>
            </div>
            <p className="text-sm text-gray-600">
              Créez une nouvelle playlist personnalisée pour vos enfants
            </p>
          </button>

          <button
            onClick={() => setShowAssociateChildModal(true)}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 text-left hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-6 h-6 text-primary" />
              <h3 className="font-semibold text-gray-900">Associer un enfant</h3>
            </div>
            <p className="text-sm text-gray-600">
              Associez un profil enfant existant à votre compte
            </p>
          </button>
        </div>

        {/* Lecteur Spotify (si connecté et piste en cours) */}
        {spotifyConnected && playerState.currentTrack && (
          <div className="mt-8 bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-6">
              <img
                src={playerState.currentTrack.album?.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'}
                alt={playerState.currentTrack.album?.name}
                className="w-16 h-16 rounded-xl shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{playerState.currentTrack.name}</h3>
                <p className="text-gray-300 text-sm">
                  {playerState.currentTrack.artists?.map((a: any) => a.name).join(', ')}
                </p>
              </div>
            </div>

            {/* Contrôles */}
            <div className="flex items-center justify-center gap-6 mb-6">
              <button
                onClick={() => handleSpotifyControl('previous')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipBack className="w-6 h-6" />
              </button>
              
              <button
                onClick={() => handleSpotifyControl(playerState.isPlaying ? 'pause' : 'play')}
                className="bg-primary hover:bg-primary-600 text-white rounded-full p-3 transition-colors"
              >
                {playerState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
              </button>
              
              <button
                onClick={() => handleSpotifyControl('next')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <SkipForward className="w-6 h-6" />
              </button>
            </div>
            
            {/* Action d'exclusion */}
            <div className="flex items-center justify-center">
              <button
                onClick={() => handleExcludeTrack(playerState.currentTrack)}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Exclure cette chanson
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Créer une playlist */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Créer une playlist</h3>
              <button
                onClick={() => setShowCreatePlaylistModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la playlist
                </label>
                <input
                  type="text"
                  placeholder="Ma nouvelle playlist"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (optionnel)
                </label>
                <textarea
                  placeholder="Description de la playlist..."
                  value={newPlaylistDescription}
                  onChange={(e) => setNewPlaylistDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none"
                  rows={3}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleCreatePlaylist}
                  disabled={!newPlaylistName.trim()}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Créer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Associer un enfant */}
      {showAssociateChildModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Associer un enfant</h3>
              <button
                onClick={() => setShowAssociateChildModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Identifiant unique de l'enfant
                </label>
                <input
                  type="text"
                  placeholder="ID-ENFANT-XXXX"
                  value={childIdentifier}
                  onChange={(e) => setChildIdentifier(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-1">
                  Demandez l'identifiant à l'autre parent ou trouvez-le dans les paramètres de l'enfant
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAssociateChildModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAssociateChild}
                  disabled={!childIdentifier.trim()}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-colors"
                >
                  Associer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}