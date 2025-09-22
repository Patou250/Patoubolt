import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

export default function Child() {
  const [child, setChild] = useState<ChildData | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [history, setHistory] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('👶 Child page loading...')
    loadChildData()
  }, [])

  const loadChildData = () => {
    // Check child session
    const childData = localStorage.getItem('patou_child_session')
    if (!childData) {
      console.log('❌ No child session, redirect to login')
      navigate('/child/login')
      return
    }

    try {
      const parsedChild = JSON.parse(childData)
      const childInfo = parsedChild.child || parsedChild
      setChild(childInfo)
      console.log('✅ Child session found:', childInfo.name)
    } catch (error) {
      console.error('❌ Error parsing child session:', error)
      navigate('/child/login')
      return
    }

    // Check Spotify tokens
    const tokens = getSpotifyTokens()
    if (tokens) {
      console.log('✅ Spotify tokens found')
      setAccessToken(tokens.access_token)
    } else {
      console.log('⚠️ No Spotify tokens')
    }

    // Load history
    loadHistory()
    setLoading(false)
  }

  const loadHistory = () => {
    const historyRaw = localStorage.getItem('patou_play_history')
    if (historyRaw) {
      try {
        const historyData = JSON.parse(historyRaw)
        setHistory(historyData.slice(0, 5))
        console.log('✅ History loaded:', historyData.length)
      } catch (error) {
        console.error('❌ Error parsing history:', error)
      }
    }
  }

  const handlePlayTrack = async (trackId: string) => {
    console.log('▶️ Playing track:', trackId)
    
    if (!accessToken) {
      alert('Demande à tes parents de connecter Spotify !')
      return
    }

    try {
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
        console.log('✅ Track started')
        alert('🎵 Musique démarrée !')
      } else {
        console.error('❌ Play error:', response.status)
        if (response.status === 404) {
          alert('Ouvre Spotify sur ton téléphone d\'abord !')
        } else {
          alert('Erreur de lecture')
        }
      }
    } catch (error) {
      console.error('❌ Error playing:', error)
      alert('Erreur de connexion')
    }
  }

  const handleSearch = () => {
    console.log('🔍 Navigate to search')
    navigate('/child/search')
  }

  const handleFavorites = () => {
    console.log('❤️ Navigate to favorites')
    navigate('/child/favorites')
  }

  const handleLogout = () => {
    console.log('👋 Child logout')
    localStorage.removeItem('patou_child_session')
    navigate('/child/login')
  }

  const handleSpotifyConnect = () => {
    alert('Demande à tes parents de connecter Spotify dans leur espace !')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Session expirée</h3>
          <p className="text-gray-600 mb-6">Tu dois te reconnecter</p>
          <button 
            onClick={() => navigate('/child/login')}
            className="px-6 py-3 bg-yellow-400 text-gray-900 font-bold rounded-xl hover:bg-yellow-500 transition-colors"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/patou-logo.svg" alt="Patou" className="h-8" />
              <span className="text-xl font-bold text-gray-800">
                Salut {child.name} {child.emoji}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 rounded-lg transition-colors"
            >
              Sortir
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Main Player Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8 border border-white/20">
          <div className="text-center">
            <div className="text-6xl mb-6">🎵</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lecteur Musical</h2>
            
            {!accessToken ? (
              <div className="space-y-4">
                <p className="text-gray-600">Spotify n'est pas connecté</p>
                <button
                  onClick={handleSpotifyConnect}
                  className="px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Demander à papa/maman
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-600 font-semibold">🎵 Spotify connecté !</p>
                <button
                  onClick={() => handlePlayTrack('3n3Ppam7vgaVa1iaRUc9Lp')}
                  className="px-8 py-4 bg-green-500 text-white font-bold text-lg rounded-xl hover:bg-green-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  ▶️ Écouter Hakuna Matata
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleSearch}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all text-center group"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              🔍
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Rechercher</h3>
            <p className="text-gray-600">Trouve de nouvelles chansons</p>
          </button>

          <button
            onClick={handleFavorites}
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all text-center group"
          >
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              ❤️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Mes favoris</h3>
            <p className="text-gray-600">Tes chansons préférées</p>
          </button>
        </div>

        {/* Recent History */}
        {history.length > 0 && (
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4">🕐 Récemment écouté</h3>
            <div className="space-y-3">
              {history.map((track, index) => (
                <div key={`${track.trackId}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <img 
                    src={track.cover} 
                    alt={track.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{track.name}</h4>
                    <p className="text-sm text-gray-600">{track.artist}</p>
                  </div>
                  <button
                    onClick={() => handlePlayTrack(track.trackId)}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    ▶️
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 p-4">
          <div className="max-w-md mx-auto flex justify-around">
            <button
              onClick={() => navigate('/child')}
              className="flex flex-col items-center py-2 px-4 text-yellow-600 bg-yellow-100 rounded-lg"
            >
              <span className="text-xl mb-1">🎵</span>
              <span className="text-xs font-medium">Player</span>
            </button>
            
            <button
              onClick={handleSearch}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl mb-1">🔍</span>
              <span className="text-xs font-medium">Recherche</span>
            </button>
            
            <button
              onClick={handleFavorites}
              className="flex flex-col items-center py-2 px-4 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-xl mb-1">❤️</span>
              <span className="text-xs font-medium">Favoris</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}