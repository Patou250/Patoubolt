import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, LogOut, Heart, Clock, Music, Plus, List, Play, Trash2, Search, Star } from 'lucide-react'
import PlayerSdk from '../components/PlayerSdk'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { FavoritesApi } from '../utils/favorites-api'
import type { Favorite, PlayHistory } from '../types/favorites'
import { supabase } from '../lib/supabase'

interface ChildPlaylist {
  id: string
  name: string
  emoji: string
  tracks: string[]
  created_at: string
}

interface ChildSession {
  child: {
    id: string
    name: string
    emoji: string
    parent_id: string
  }
}

export default function Child() {
  const navigate = useNavigate()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [childSession, setChildSession] = useState<ChildSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [recentHistory, setRecentHistory] = useState<PlayHistory[]>([])
  const [currentTrackId, setCurrentTrackId] = useState<string | null>(null)
  const [isFavorited, setIsFavorited] = useState(false)
  const [playlists, setPlaylists] = useState<ChildPlaylist[]>([])
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistEmoji, setNewPlaylistEmoji] = useState('🎵')
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [showMusicCatalog, setShowMusicCatalog] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [kidsTracks, setKidsTracks] = useState<any[]>([])
  const [loadingTracks, setLoadingTracks] = useState(false)
  const [importingCatalog, setImportingCatalog] = useState(false)

  const playlistEmojis = ['🎵', '🎶', '🎤', '🎸', '🥁', '🎹', '🎺', '🎷', '🎻', '🌟', '❤️', '🎈', '🌈', '⭐', '🎯', '🚀']

  useEffect(() => {
    checkAccess()
    loadChildData()
    loadKidsMusic()
  }, [])

  const checkAccess = () => {
    // Check child session
    const sessionData = localStorage.getItem('child_session')
    console.log('🔍 Session data from localStorage:', sessionData)
    
    if (!sessionData) {
      console.log('❌ No session data found')
      navigate('/child/login')
      return
    }

    try {
      const session = JSON.parse(sessionData) as ChildSession
      console.log('📦 Parsed session:', session)
      console.log('👶 Child data:', session.child)
      
      setChildSession(session)
    } catch (error) {
      console.error('❌ Failed to parse session:', error)
      navigate('/child/login')
      return
    }

    // Check parent tokens
    const tokens = getSpotifyTokens()
    if (!tokens) {
      navigate('/child/login')
      return
    }

    setAccessToken(tokens.access_token)
    setLoading(false)
  }

  const loadChildData = async () => {
    const sessionData = localStorage.getItem('child_session')
    if (!sessionData) {
      console.error('No child session found')
      return
    }

    try {
      const session = JSON.parse(sessionData) as ChildSession
      
      if (!session.child || !session.child.id) {
        console.error('Invalid child session data:', session)
        navigate('/child/login')
        return
      }
      
      // Load favorites from localStorage for demo
      const storedFavorites = localStorage.getItem(`favorites_${session.child.id}`)
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites))
      }

      // Load recent history from localStorage for demo
      const storedHistory = localStorage.getItem(`history_${session.child.id}`)
      if (storedHistory) {
        setRecentHistory(JSON.parse(storedHistory))
      }

      // Load child playlists
      await loadPlaylists(session.child.id)
    } catch (error) {
      console.error('Failed to load child data:', error)
    }
  }

  const loadPlaylists = async (childId: string) => {
    try {
      // For now, store playlists in localStorage (in production, use database)
      const stored = localStorage.getItem(`child_playlists_${childId}`)
      if (stored) {
        setPlaylists(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Failed to load playlists:', error)
    }
  }

  const savePlaylist = async (childId: string, playlist: ChildPlaylist) => {
    try {
      const stored = localStorage.getItem(`child_playlists_${childId}`)
      const existing = stored ? JSON.parse(stored) : []
      const updated = [...existing, playlist]
      localStorage.setItem(`child_playlists_${childId}`, JSON.stringify(updated))
      setPlaylists(updated)
    } catch (error) {
      console.error('Failed to save playlist:', error)
    }
  }

  const createPlaylist = async () => {
    if (!childSession || !childSession.child || !newPlaylistName.trim()) {
      console.error('Missing session or playlist name')
      return
    }

    const newPlaylist: ChildPlaylist = {
      id: Date.now().toString(),
      name: newPlaylistName.trim(),
      emoji: newPlaylistEmoji,
      tracks: [],
      created_at: new Date().toISOString()
    }

    await savePlaylist(childSession.child.id, newPlaylist)
    setNewPlaylistName('')
    setNewPlaylistEmoji('🎵')
    setShowCreatePlaylist(false)
  }

  const addToPlaylist = async (playlistId: string) => {
    if (!childSession || !childSession.child || !currentTrackId) {
      console.error('Missing session or track for playlist add')
      return
    }

    try {
      const stored = localStorage.getItem(`child_playlists_${childSession.child.id}`)
      if (!stored) return

      const playlists = JSON.parse(stored)
      const playlistIndex = playlists.findIndex((p: ChildPlaylist) => p.id === playlistId)
      
      if (playlistIndex !== -1) {
        if (!playlists[playlistIndex].tracks.includes(currentTrackId)) {
          playlists[playlistIndex].tracks.push(currentTrackId)
          localStorage.setItem(`child_playlists_${childSession.child.id}`, JSON.stringify(playlists))
          setPlaylists(playlists)
        }
      }
    } catch (error) {
      console.error('Failed to add to playlist:', error)
    }
  }

  const deletePlaylist = async (playlistId: string) => {
    if (!childSession || !childSession.child) {
      console.error('Missing session for playlist delete')
      return
    }

    try {
      const stored = localStorage.getItem(`child_playlists_${childSession.child.id}`)
      if (!stored) return

      const playlists = JSON.parse(stored)
      const filtered = playlists.filter((p: ChildPlaylist) => p.id !== playlistId)
      localStorage.setItem(`child_playlists_${childSession.child.id}`, JSON.stringify(filtered))
      setPlaylists(filtered)
    } catch (error) {
      console.error('Failed to delete playlist:', error)
    }
  }

  const loadKidsMusic = async () => {
    setLoadingTracks(true)
    try {
      // Vérifier si on a déjà un catalogue en cache
      const cachedCatalog = localStorage.getItem('kids_music_catalog')
      const cacheTimestamp = localStorage.getItem('kids_music_cache_time')
      const cacheAge = cacheTimestamp ? Date.now() - parseInt(cacheTimestamp) : Infinity
      
      // Cache valide pendant 24 heures
      if (cachedCatalog && cacheAge < 24 * 60 * 60 * 1000) {
        console.log('📦 Utilisation du cache du catalogue')
        setKidsTracks(JSON.parse(cachedCatalog))
        return
      }

      // Sinon, charger quelques chansons par défaut
      const defaultTracks = [
        {
          id: '3VNWq8rTnQG6fM1eldSpZ0',
          name: 'Let It Go',
          artists: [{ name: 'Idina Menzel' }],
          album: {
            name: 'Frozen (Original Motion Picture Soundtrack)',
            images: [{ url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300' }]
          },
          duration_ms: 225000,
          explicit: false,
          uri: 'spotify:track:3VNWq8rTnQG6fM1eldSpZ0'
        },
        {
          id: '5ChkMS8OtdzJeqyybCc9R5',
          name: 'Happy',
          artists: [{ name: 'Pharrell Williams' }],
          album: {
            name: 'G I R L',
            images: [{ url: 'https://images.pexels.com/photos/1540406/pexels-photo-1540406.jpeg?auto=compress&cs=tinysrgb&w=300' }]
          },
          duration_ms: 232000,
          explicit: false,
          uri: 'spotify:track:5ChkMS8OtdzJeqyybCc9R5'
        },
        {
          id: '4VqPOruhp5EdPBeR92t6lQ',
          name: 'Uptown Funk',
          artists: [{ name: 'Mark Ronson ft. Bruno Mars' }],
          album: {
            name: 'Uptown Special',
            images: [{ url: 'https://images.pexels.com/photos/1407322/pexels-photo-1407322.jpeg?auto=compress&cs=tinysrgb&w=300' }]
          },
          duration_ms: 270000,
          explicit: false,
          uri: 'spotify:track:4VqPOruhp5EdPBeR92t6lQ'
        },
        {
          id: '6UelLqGlWMcVH1E5c4H7lY',
          name: 'Can\'t Stop the Feeling!',
          artists: [{ name: 'Justin Timberlake' }],
          album: {
            name: 'Trolls (Original Motion Picture Soundtrack)',
            images: [{ url: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300' }]
          },
          duration_ms: 236000,
          explicit: false,
          uri: 'spotify:track:6UelLqGlWMcVH1E5c4H7lY'
        }
      ]
      
      setKidsTracks(defaultTracks)
    } catch (error) {
      console.error('Failed to load kids music:', error)
    } finally {
      setLoadingTracks(false)
    }
  }

  const importFullCatalog = async () => {
    if (!accessToken) {
      console.error('Aucun token Spotify disponible')
      return
    }

    setImportingCatalog(true)
    try {
      const { importSpotifyKidsCatalog } = await import('../utils/spotify-catalog')
      const tracks = await importSpotifyKidsCatalog()
      
      console.log(`✅ ${tracks.length} chansons importées depuis Spotify`)
      setKidsTracks(tracks)
      
      // Mettre en cache
      localStorage.setItem('kids_music_catalog', JSON.stringify(tracks))
      localStorage.setItem('kids_music_cache_time', Date.now().toString())
      
    } catch (error) {
      console.error('Erreur lors de l\'import du catalogue:', error)
    } finally {
      setImportingCatalog(false)
    }
  }

  const playTrack = async (trackUri: string, trackId: string) => {
    if (!accessToken) return
    
    try {
      // Utiliser l'API Spotify pour démarrer la lecture
      const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [trackUri]
        })
      })
      
      if (response.ok) {
        console.log('✅ Track started:', trackId)
        // Le PlayerSdk détectera automatiquement le changement
      } else {
        console.warn('⚠️ Failed to start track:', response.status)
      }
    } catch (error) {
      console.error('❌ Error playing track:', error)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const filteredTracks = kidsTracks.filter(track =>
    track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artists[0].name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTrackChange = async (trackId: string) => {
    if (!childSession || !childSession.child) {
      console.error('No valid child session for track change')
      return
    }

    setCurrentTrackId(trackId)
    
    // Check if favorited
    const favorited = await FavoritesApi.isFavorited(childSession.child.id, trackId)
    setIsFavorited(favorited)

    // Record play event
    await FavoritesApi.recordPlayEvent(childSession.child.id, trackId, 'start')
  }

  const handleToggleFavorite = async () => {
    if (!childSession || !childSession.child || !currentTrackId) {
      console.error('Missing session or track for favorite toggle')
      return
    }

    try {
      // Toggle favorite in localStorage for demo
      const favoritesKey = `favorites_${childSession.child.id}`
      const storedFavorites = localStorage.getItem(favoritesKey)
      let favorites = storedFavorites ? JSON.parse(storedFavorites) : []
      
      const existingIndex = favorites.findIndex((f: any) => f.track_id === currentTrackId)
      
      if (existingIndex >= 0) {
        // Remove favorite
        favorites.splice(existingIndex, 1)
        setIsFavorited(false)
      } else {
        // Add favorite
        favorites.push({
          id: Date.now().toString(),
          child_id: childSession.child.id,
          track_id: currentTrackId,
          created_at: new Date().toISOString()
        })
        setIsFavorited(true)
      }
      
      localStorage.setItem(favoritesKey, JSON.stringify(favorites))
      setFavorites(favorites)
      
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem('child_session')
    navigate('/child/login')
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
            Vérification de l'accès au lecteur
          </p>
        </div>
      </div>
    )
  }

  if (!accessToken || !childSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Accès non autorisé
          </h2>
          <p className="text-gray-600 mb-4">
            Vous devez passer par la page de connexion enfant.
          </p>
          <button
            onClick={() => navigate('/child/login')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Aller à la connexion
          </button>
        </div>
      </div>
    )
  }

  if (!childSession.child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Session invalide
          </h2>
          <p className="text-gray-600 mb-4">
            Les données de session sont corrompues.
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('child_session')
              navigate('/child/login')
            }}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Recommencer
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
              <div className="text-4xl">{childSession.child?.emoji || '👶'}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Salut {childSession.child?.name || 'Enfant'} ! 👋
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Music className="w-6 h-6 text-purple-600 mr-2" />
                  Lecteur Spotify
                </h2>
                {currentTrackId && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleFavorite}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                        isFavorited
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                      <span>{isFavorited ? 'Favoris' : 'Favoris'}</span>
                    </button>
                    
                    {playlists.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={() => setSelectedPlaylist(selectedPlaylist ? null : 'menu')}
                          className="flex items-center space-x-2 px-3 py-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Playlist</span>
                        </button>
                        
                        {selectedPlaylist === 'menu' && (
                          <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                            {playlists.map((playlist) => (
                              <button
                                key={playlist.id}
                                onClick={() => {
                                  addToPlaylist(playlist.id)
                                  setSelectedPlaylist(null)
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2"
                              >
                                <span>{playlist.emoji}</span>
                                <span>{playlist.name}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <PlayerSdk 
                accessToken={accessToken} 
                onTrackChange={handleTrackChange}
              />
            </div>
            
            {/* Music Catalog */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                  <Star className="w-6 h-6 text-yellow-500 mr-2" />
                  Musique pour Enfants ({kidsTracks.length} chansons)
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={importFullCatalog}
                    disabled={importingCatalog}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg transition-colors text-sm"
                  >
                    {importingCatalog ? '⏳ Import...' : '📥 Importer Catalogue'}
                  </button>
                  <button
                    onClick={() => setShowMusicCatalog(!showMusicCatalog)}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      showMusicCatalog 
                        ? 'bg-purple-500 text-white hover:bg-purple-600' 
                        : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }`}
                  >
                    {showMusicCatalog ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher une chanson ou un artiste..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-base"
                  />
                </div>
                
                {/* Tracks List */}
                {showMusicCatalog && (
                  <div className="max-h-96 overflow-y-auto space-y-3">
                    {loadingTracks || importingCatalog ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2"></div>
                        <p className="text-gray-600">
                          {importingCatalog ? 'Import du catalogue Spotify...' : 'Chargement des chansons...'}
                        </p>
                        {importingCatalog && (
                          <p className="text-sm text-gray-500 mt-2">
                            Cela peut prendre quelques minutes...
                          </p>
                        )}
                      </div>
                    ) : filteredTracks.length === 0 ? (
                      <div className="text-center py-8">
                        <Music className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600">
                          {searchQuery ? `Aucune chanson trouvée pour "${searchQuery}"` : 'Aucune chanson disponible'}
                        </p>
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="mt-2 text-purple-600 hover:text-purple-800 text-sm"
                          >
                            Effacer la recherche
                          </button>
                        )}
                      </div>
                    ) : (
                      <>
                        {searchQuery && (
                          <div className="text-sm text-gray-600 mb-2">
                            {filteredTracks.length} chanson{filteredTracks.length > 1 ? 's' : ''} trouvée{filteredTracks.length > 1 ? 's' : ''}
                          </div>
                        )}
                        {filteredTracks.map((track) => (
                          <div key={track.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all duration-200 border border-purple-100">
                            <img
                              src={track.album.images[0]?.url}
                              alt={track.album.name}
                              className="w-12 h-12 rounded-lg object-cover shadow-md flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate text-base">{track.name}</h4>
                              <p className="text-purple-600 truncate text-sm">{track.artists[0].name}</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">
                                  {formatDuration(track.duration_ms)}
                                </span>
                                {!track.explicit && (
                                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                    👶 Enfant
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1">
                              {/* Bouton Favoris */}
                              <button
                                onClick={async () => {
                                  if (!childSession?.child) return
                                  try {
                                    // Toggle favorite in localStorage for demo
                                    const favoritesKey = `favorites_${childSession.child.id}`
                                    const storedFavorites = localStorage.getItem(favoritesKey)
                                    let favorites = storedFavorites ? JSON.parse(storedFavorites) : []
                                    
                                    const existingIndex = favorites.findIndex((f: any) => f.track_id === track.id)
                                    
                                    if (existingIndex >= 0) {
                                      favorites.splice(existingIndex, 1)
                                    } else {
                                      favorites.push({
                                        id: Date.now().toString(),
                                        child_id: childSession.child.id,
                                        track_id: track.id,
                                        created_at: new Date().toISOString()
                                      })
                                    }
                                    
                                    localStorage.setItem(favoritesKey, JSON.stringify(favorites))
                                    setFavorites(favorites)
                                  } catch (error) {
                                    console.error('Failed to toggle favorite:', error)
                                  }
                                }}
                                className="p-2 bg-white hover:bg-red-50 text-red-500 hover:text-red-600 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Ajouter aux favoris"
                              >
                                <Heart className="w-4 h-4" />
                              </button>
                              
                              {/* Bouton Playlist */}
                              {playlists.length > 0 && (
                                <div className="relative">
                                  <button
                                    onClick={() => setSelectedPlaylist(selectedPlaylist === track.id ? null : track.id)}
                                    className="p-2 bg-white hover:bg-purple-50 text-purple-500 hover:text-purple-600 rounded-full transition-all duration-200 shadow-sm hover:shadow-md"
                                    title="Ajouter à une playlist"
                                  >
                                    <Plus className="w-4 h-4" />
                                  </button>
                                  
                                  {selectedPlaylist === track.id && (
                                    <div className="absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                      {playlists.map((playlist) => (
                                        <button
                                          key={playlist.id}
                                          onClick={() => {
                                            // Ajouter à la playlist
                                            if (childSession?.child) {
                                              try {
                                                const stored = localStorage.getItem(`child_playlists_${childSession.child.id}`)
                                                if (stored) {
                                                  const playlists = JSON.parse(stored)
                                                  const playlistIndex = playlists.findIndex((p: ChildPlaylist) => p.id === playlist.id)
                                                  if (playlistIndex !== -1 && !playlists[playlistIndex].tracks.includes(track.id)) {
                                                    playlists[playlistIndex].tracks.push(track.id)
                                                    localStorage.setItem(`child_playlists_${childSession.child.id}`, JSON.stringify(playlists))
                                                    setPlaylists(playlists)
                                                  }
                                                }
                                              } catch (error) {
                                                console.error('Failed to add to playlist:', error)
                                              }
                                            }
                                            setSelectedPlaylist(null)
                                          }}
                                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-2 text-sm"
                                        >
                                          <span>{playlist.emoji}</span>
                                          <span>{playlist.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                              
                              {/* Bouton Play */}
                              <button
                              onClick={() => playTrack(track.uri, track.id)}
                              className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                              title={`Écouter ${track.name}`}
                            >
                              <Play className="w-4 h-4" />
                            </button>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Playlists */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 flex items-center">
                  <List className="w-5 h-5 text-purple-500 mr-2" />
                  Mes Playlists ({playlists.length})
                </h3>
                <button
                  onClick={() => setShowCreatePlaylist(true)}
                  className="p-2 bg-purple-100 text-purple-600 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {showCreatePlaylist && (
                <div className="mb-4 p-4 bg-purple-50 rounded-lg">
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Nom de ma playlist"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      maxLength={30}
                    />
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Emoji:</span>
                      <div className="flex flex-wrap gap-1">
                        {playlistEmojis.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => setNewPlaylistEmoji(emoji)}
                            className={`w-8 h-8 rounded-lg text-lg hover:bg-purple-200 transition-colors ${
                              newPlaylistEmoji === emoji ? 'bg-purple-200' : 'bg-white'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={createPlaylist}
                        disabled={!newPlaylistName.trim()}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white py-2 rounded-lg text-sm transition-colors"
                      >
                        Créer
                      </button>
                      <button
                        onClick={() => {
                          setShowCreatePlaylist(false)
                          setNewPlaylistName('')
                          setNewPlaylistEmoji('🎵')
                        }}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg text-sm transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {playlists.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucune playlist pour le moment.<br />
                    Clique sur + pour en créer une !
                  </p>
                ) : (
                  playlists.map((playlist) => (
                    <div key={playlist.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <span className="text-lg">{playlist.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {playlist.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {playlist.tracks.length} titre{playlist.tracks.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-1 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Lire la playlist"
                        >
                          <Play className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePlaylist(playlist.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          title="Supprimer la playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Favorites */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 text-red-500 mr-2" />
                Mes Favoris ({favorites.length})
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {favorites.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun favori pour le moment.<br />
                    Clique sur ❤️ pendant l'écoute !
                  </p>
                ) : (
                  favorites.slice(0, 5).map((favorite) => (
                    <div key={favorite.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Track {favorite.track_id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(favorite.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 text-blue-500 mr-2" />
                Récemment écouté
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {recentHistory.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-4">
                    Aucun historique pour le moment.<br />
                    Commence à écouter de la musique !
                  </p>
                ) : (
                  recentHistory.slice(0, 5).map((play) => (
                    <div key={play.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Track {play.track_id.slice(-8)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {Math.floor(play.duration_sec / 60)}:{(play.duration_sec % 60).toString().padStart(2, '0')} • {' '}
                          {new Date(play.started_at).toLocaleTimeString('fr-FR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Fun Stats */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg p-6 text-white">
              <h3 className="text-lg font-bold mb-4">🎵 Mes Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Favoris :</span>
                  <span className="font-bold">{favorites.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Playlists :</span>
                  <span className="font-bold">{playlists.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Écoutes :</span>
                  <span className="font-bold">{recentHistory.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temps total :</span>
                  <span className="font-bold">
                    {Math.floor(recentHistory.reduce((acc, play) => acc + play.duration_sec, 0) / 60)}min
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}