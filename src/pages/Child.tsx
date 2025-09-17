import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Music, Heart, Clock, ChevronRight } from 'lucide-react'
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

interface Playlist {
  id: string
  title: string
  cover: string
  type: 'favorites' | 'weekly' | 'custom'
}

export default function Child() {
  const [child, setChild] = useState<ChildData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [history, setHistory] = useState<Track[]>([])

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

    // Charger les playlists
    loadPlaylists()
    
    // Charger l'historique
    loadHistory()
  }, [])

  const loadPlaylists = () => {
    // Simuler des playlists
    const mockPlaylists: Playlist[] = [
      {
        id: 'favorites',
        title: 'Mes Favoris ❤️',
        cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'favorites'
      },
      {
        id: 'weekly',
        title: 'Playlist de la semaine 🎵',
        cover: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'weekly'
      },
      {
        id: 'custom1',
        title: 'Mes Découvertes 🌟',
        cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=300',
        type: 'custom'
      }
    ]
    setPlaylists(mockPlaylists)
  }

  const loadHistory = () => {
    const historyRaw = localStorage.getItem('patou_play_history')
    if (historyRaw) {
      const historyData = JSON.parse(historyRaw)
      setHistory(historyData.slice(0, 10)) // Limiter à 10 éléments
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

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `Il y a ${days} jour${days > 1 ? 's' : ''}`
    if (hours > 0) return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`
    if (minutes > 0) return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
    return 'À l\'instant'
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 pb-20 md:pb-4">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        
        {/* Header avec salutation */}
        <div className="text-center mb-6 md:mb-8">
          <div className="text-6xl md:text-8xl mb-4">{child.emoji}</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Bonjour {child.name} ! 👋
          </h1>
          <p className="text-gray-600 mt-2">Prêt pour une nouvelle aventure musicale ?</p>
        </div>

        {/* Section 1: PlayerSdk */}
        <div className="flex justify-center mb-6 md:mb-8">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Music className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold text-gray-800">Lecteur Musical</h2>
            </div>
            {accessToken ? (
              <PlayerSdk accessToken={accessToken} />
            ) : (
              <div className="text-center py-8">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Lecteur indisponible</h3>
                <p className="text-gray-600 mb-4">Connexion Spotify requise</p>
                <Link 
                  to="/parent/login" 
                  className="inline-block px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Demander à papa/maman
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Playlists en carrousel */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Mes Playlists
            </h2>
            <Link 
              to="/child/search" 
              className="text-blue-500 hover:text-blue-600 transition-colors flex items-center gap-1"
            >
              Voir tout
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4" style={{ width: 'max-content' }}>
              {playlists.map(playlist => (
                <div 
                  key={playlist.id}
                  className="flex-shrink-0 w-48 bg-white rounded-xl shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer"
                >
                  <img 
                    src={playlist.cover} 
                    alt={playlist.title}
                    className="w-full h-32 object-cover rounded-t-xl"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 truncate">
                      {playlist.title}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {playlist.type === 'favorites' && 'Tes chansons préférées'}
                      {playlist.type === 'weekly' && 'Nouvelle sélection'}
                      {playlist.type === 'custom' && 'Playlist personnalisée'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Historique d'écoute */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="w-6 h-6 text-orange-500" />
            Récemment écouté
          </h2>
          
          {history.length > 0 ? (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                {history.map((track, index) => (
                  <div 
                    key={`${track.trackId}-${index}`}
                    className="p-4 hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-3"
                  >
                    <img 
                      src={track.cover} 
                      alt={track.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-sm truncate">
                        {track.name}
                      </h3>
                      <p className="text-xs text-gray-600 truncate">
                        {track.artist}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTimeAgo(track.ts)}
                      </p>
                    </div>
                    <Link
                      to={`/player?trackId=${track.trackId}`}
                      className="flex-shrink-0 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Music className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun historique</h3>
              <p className="text-gray-600 mb-4">
                Commence à écouter de la musique pour voir ton historique ici
              </p>
              <Link 
                to="/child/search" 
                className="inline-block px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Découvrir de la musique
              </Link>
            </div>
          )}
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Link 
            to="/child/search" 
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">🔍</div>
            <span className="text-sm font-semibold text-gray-800">Rechercher</span>
          </Link>
          
          <Link 
            to="/child/favorites" 
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">❤️</div>
            <span className="text-sm font-semibold text-gray-800">Favoris</span>
          </Link>
          
          <Link 
            to="/child/playlists" 
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">🎧</div>
            <span className="text-sm font-semibold text-gray-800">Playlists</span>
          </Link>
          
          <Link 
            to="/child/history" 
            className="bg-white rounded-xl shadow-md p-4 text-center hover:shadow-lg transition-all transform hover:-translate-y-1"
          >
            <div className="text-3xl mb-2">🕒</div>
            <span className="text-sm font-semibold text-gray-800">Historique</span>
          </Link>
        </div>
      </div>
    </div>
  )
}