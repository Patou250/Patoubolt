import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Music, Users, Settings, BarChart3, History, Shield, Clock, Calendar,
  Plus, Edit2, LogOut, AlertCircle, Volume2, Play, Pause, SkipForward, SkipBack,
  Headphones, UserPlus, Timer, List, TrendingUp, Activity
} from 'lucide-react'
import { getParentSession, clearParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'
import styles from './ParentDashboard.module.css'

interface SpotifyPlayerState {
  isPlaying: boolean
  currentTrack: any
  position: number
  duration: number
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [playerState, setPlayerState] = useState<SpotifyPlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0
  })
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    const session = getParentSession()
    const tokens = getSpotifyTokens()
    
    // Si pas de session mais qu'on a des tokens Spotify, créer une session
    if (!session && tokens) {
      // Récupérer les infos utilisateur depuis Spotify
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
        // Pas besoin de recharger, continuer avec la session créée
        checkSpotifyConnection()
        loadChildren(parentSession)
        initializeSpotifyPlayer()
      })
      .catch(() => {
        navigate('/')
      })
      return
    }
    
    if (!session) {
      navigate('/')
      return
    }

    checkSpotifyConnection()
    loadChildren(session)
    initializeSpotifyPlayer()
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
      console.log('🔍 Loading children for session:', session)
      
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.error('❌ No authenticated user found:', userError)
        return
      }
      
      console.log('👤 Authenticated user ID:', user.id)
      
      // First, get or create the profile for this parent
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('📝 Profile not found, creating one for user:', user.id)
        
        // Create profile if it doesn't exist (without the role field)
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
          console.error('❌ Failed to create profile:', createError)
          return
        }
        
        console.log('✅ Profile created with ID:', newProfile.id)
        
        // Now get children using the new profile UUID
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', newProfile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        console.log('📋 Children loaded:', data?.length || 0)
        setChildren(data || [])
      } else {
        console.log('✅ Profile found with ID:', profile.id)
        
        // Now get children using the existing profile UUID
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', profile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        console.log('📋 Children loaded:', data?.length || 0)
        setChildren(data || [])
      }
    } catch (error) {
      console.error('❌ Failed to load children:', error)
    } finally {
      setIsLoading(false)
    }
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
    navigate('/parent/login')
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'children', label: 'Gestion Enfants', icon: Users },
    { id: 'player', label: 'Lecteur', icon: Music },
    { id: 'settings', label: 'Paramètres', icon: Settings }
  ]

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Chargement du tableau de bord...</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <img 
              src="/Patou emeraude sans fond.png" 
              alt="Patou Logo" 
              className="h-5 w-auto mr-2"
            />
            Patou Parent
          </div>
          <div className={styles.headerStatus}>
            <div className={`${styles.spotifyStatus} ${spotifyConnected ? styles.connected : styles.disconnected}`}>
              <Music size={16} />
              {spotifyConnected ? 'Spotify connecté' : 'Spotify déconnecté'}
              {!spotifyConnected && (
                <button
                  onClick={connectSpotify}
                  className={styles.connectButton}
                >
                  <Music size={12} />
                  Connecter
                </button>
              )}
            </div>
            <button onClick={handleSignOut} className={styles.secondaryButton}>
              <LogOut size={16} />
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className={styles.tabs}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''}`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </nav>

      {/* Content */}
      <main className={styles.content}>
        <div className={styles.tabContent}>
          {activeTab === 'overview' && (
            <div>
              <div className={styles.tabHeader}>
                <h2>Vue d'ensemble</h2>
                <div className={styles.headerActions}>
                  <button
                    onClick={() => navigate('/player')}
                    className={styles.secondaryButton}
                  >
                    <Music size={16} />
                    Lecteur
                  </button>
                  <button 
                    onClick={() => navigate('/parent/children')}
                    className={styles.primaryButton}
                  >
                    <Users size={16} />
                    Gérer les enfants
                  </button>
                </div>
              </div>

              {/* Actions rapides */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => navigate('/parent/children')}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <UserPlus className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Créer un enfant</h3>
                  <p className="text-emerald-100 text-sm">Ajouter un nouveau profil enfant</p>
                </button>
                
                <button
                  onClick={() => navigate('/parent/rules/choose')}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <Timer className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Régler les horaires</h3>
                  <p className="text-orange-100 text-sm">Configurer les règles d'écoute</p>
                </button>
                
                <button
                  onClick={() => navigate('/parent/curation')}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white p-6 rounded-lg text-left transition-colors"
                >
                  <Calendar className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Publier playlist</h3>
                  <p className="text-indigo-100 text-sm">Gérer les playlists de la semaine</p>
                </button>
              </div>
              <div className={styles.childrenGrid}>
                {children.map(child => (
                  <div key={child.id} className={styles.childCard}>
                    <div className={styles.childInfo}>
                      <h3>{child.emoji} {child.name}</h3>
                      <p className={styles.childStats}>
                        Créé le {new Date(child.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className={styles.childActions}>
                      <button
                        onClick={() => navigate(`/parent/rules/${child.id}`)}
                        className={styles.iconButton}
                        title="Règles"
                      >
                        <Shield size={16} />
                      </button>
                      <button
                        onClick={() => navigate('/parent/children')}
                        className={styles.iconButton}
                        title="Modifier"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
                
                {children.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun enfant configuré</h3>
                    <p className="text-gray-600 mb-6">Commencez par créer le profil de votre premier enfant</p>
                    <button
                      onClick={() => navigate('/parent/children')}
                      className={styles.primaryButton}
                    >
                      <Plus size={16} />
                      Créer un profil enfant
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div>
              <div className={styles.tabHeader}>
                <h2>Gestion des Enfants</h2>
                <div className={styles.headerActions}>
                  <button
                    onClick={() => navigate('/parent/children')}
                    className={styles.primaryButton}
                  >
                    <Plus size={16} />
                    Ajouter un enfant
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {children.map(child => (
                  <div key={child.id} className="bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-3xl">{child.emoji}</div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-600">
                          Créé le {new Date(child.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <button
                        onClick={() => navigate(`/parent/rules/${child.id}`)}
                        className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        <Shield size={16} />
                        <span>Configurer les règles</span>
                      </button>
                      
                      <button
                        onClick={() => navigate('/parent/children')}
                        className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Edit2 size={16} />
                        <span>Modifier le profil</span>
                      </button>
                    </div>
                  </div>
                ))}
                
                {children.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun profil enfant</h3>
                    <p className="text-gray-600 mb-6">Créez le premier profil pour commencer</p>
                    <button
                      onClick={() => navigate('/parent/children')}
                      className={styles.primaryButton}
                    >
                      <Plus size={16} />
                      Créer un profil
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'player' && (
            <div>
              <div className={styles.tabHeader}>
                <h2>Lecteur Spotify Parent</h2>
                <div className={styles.headerActions}>
                  <div className={`${styles.spotifyStatus} ${spotifyConnected ? styles.connected : styles.disconnected}`}>
                    <Headphones size={16} />
                    {spotifyConnected ? 'Connecté' : 'Déconnecté'}
                  </div>
                </div>
              </div>

              {!spotifyConnected ? (
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Spotify non connecté</h3>
                  <p className="text-gray-600 mb-6">
                    Connectez votre compte Spotify Premium pour utiliser le lecteur
                  </p>
                  <button
                    onClick={connectSpotify}
                    className={styles.primaryButton}
                  >
                    <Music size={16} />
                    Connecter Spotify
                  </button>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-6">
                  {playerState.currentTrack ? (
                    <div className="flex items-center space-x-4 mb-6">
                      <img
                        src={playerState.currentTrack.album?.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300'}
                        alt={playerState.currentTrack.album?.name}
                        className="w-16 h-16 rounded-lg shadow-lg"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold">{playerState.currentTrack.name}</h3>
                        <p className="text-gray-300">
                          {playerState.currentTrack.artists?.map((a: any) => a.name).join(', ')}
                        </p>
                        <p className="text-gray-400 text-sm">{playerState.currentTrack.album?.name}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center mb-6">
                      <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-400">Aucune musique en cours</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Ouvrez Spotify et transférez la lecture vers "Patou Parent Player"
                      </p>
                    </div>
                  )}

                  {/* Barre de progression */}
                  {playerState.currentTrack && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                        <span>{formatTime(playerState.position)}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-1">
                          <div
                            className="bg-green-500 h-1 rounded-full transition-all duration-300"
                            style={{ 
                              width: `${playerState.duration > 0 ? (playerState.position / playerState.duration) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span>{formatTime(playerState.duration)}</span>
                      </div>
                    </div>
                  )}

                  {/* Contrôles */}
                  <div className="flex items-center justify-center space-x-6">
                    <button
                      onClick={() => handleSpotifyControl('previous')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipBack className="w-6 h-6" />
                    </button>
                    
                    <button
                      onClick={() => handleSpotifyControl(playerState.isPlaying ? 'pause' : 'play')}
                      className="bg-green-500 hover:bg-green-600 text-white rounded-full p-3 transition-colors"
                    >
                      {playerState.isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                    </button>
                    
                    <button
                      onClick={() => handleSpotifyControl('next')}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      <SkipForward className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === 'settings' && (
            <div>
              <div className={styles.tabHeader}>
                <h2>Paramètres</h2>
              </div>

              <div className={styles.settingsGrid}>
                <div className={styles.settingCard}>
                  <h3>Connexion Spotify</h3>
                  <div className={styles.settingItem}>
                    <span>Statut de connexion</span>
                    <div className={`${styles.spotifyStatus} ${spotifyConnected ? styles.connected : styles.disconnected}`}>
                      {spotifyConnected ? 'Connecté' : 'Déconnecté'}
                    </div>
                  </div>
                  {!spotifyConnected && (
                    <div className={styles.settingActions}>
                      <button
                        onClick={connectSpotify}
                        className={styles.primaryButton}
                      >
                        <Music size={16} />
                        Connecter Spotify
                      </button>
                    </div>
                  )}
                  <p className={styles.settingNote}>
                    Un compte Spotify Premium est requis pour utiliser le lecteur.
                  </p>
                </div>

                <div className={styles.settingCard}>
                  <h3>Gestion des données</h3>
                  <div className={styles.settingActions}>
                    <button
                      onClick={() => navigate('/parent/history')}
                      className={styles.secondaryButton}
                    >
                      <History size={16} />
                      Voir l'historique
                    </button>
                    <button
                      onClick={() => navigate('/parent/insights')}
                      className={styles.secondaryButton}
                    >
                      <BarChart3 size={16} />
                      Statistiques
                    </button>
                  </div>
                </div>

                <div className={styles.settingCard}>
                  <h3>Configuration des enfants</h3>
                  <div className={styles.settingActions}>
                    <button
                      onClick={() => navigate('/parent/children')}
                      className={styles.secondaryButton}
                    >
                      <Users size={16} />
                      Gérer les profils
                    </button>
                    <button
                      onClick={() => navigate('/parent/curation')}
                      className={styles.secondaryButton}
                    >
                      <List size={16} />
                      Gérer les playlists
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}