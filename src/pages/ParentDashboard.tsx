import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface Child {
  id: string
  name: string
  emoji: string
  parent_id: string
  created_at: string
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [user, setUser] = useState<any>(null)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 ParentDashboard loading...')
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check authentication
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('❌ No authenticated user')
        const sessionRaw = localStorage.getItem('patou_parent_session')
        if (!sessionRaw) {
          navigate('/parent/login')
          return
        }
        const session = JSON.parse(sessionRaw)
        setUser(session.parent)
      } else {
        setUser(user)
        console.log('✅ User authenticated:', user.email)
      }

      // Check Spotify connection
      const tokens = getSpotifyTokens()
      setSpotifyConnected(!!tokens)
      console.log('🎵 Spotify connected:', !!tokens)

      // Load children
      if (user) {
        await loadChildren(user.id)
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      navigate('/parent/login')
    } finally {
      setLoading(false)
    }
  }

  const loadChildren = async (userId: string) => {
    try {
      console.log('👶 Loading children for user:', userId)
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', userId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading children:', error)
        return
      }

      console.log('✅ Children loaded:', data?.length || 0)
      setChildren(data || [])
    } catch (error) {
      console.error('❌ Failed to load children:', error)
    }
  }

  const connectSpotify = () => {
    console.log('🔗 Starting Spotify connection...')
    
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const authUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=login`
    
    fetch(authUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Auth response:', data)
      if (data.authorize_url) {
        localStorage.setItem('spotify_auth_state', data.state)
        window.location.href = data.authorize_url
      } else {
        alert('Erreur: ' + (data.error || 'Réponse invalide'))
      }
    })
    .catch(error => {
      console.error('❌ Spotify auth error:', error)
      alert('Erreur de connexion Spotify: ' + error.message)
    })
  }

  const handleSignOut = async () => {
    console.log('👋 Parent logout')
    try {
      await supabase.auth.signOut()
      localStorage.clear()
      navigate('/parent/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
      localStorage.clear()
      navigate('/parent/login')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/patou-logo.svg" alt="Patou" className="h-8" />
              <h1 className="text-2xl font-bold text-emerald-600">Dashboard Parent</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user?.email || 'Utilisateur'}
              </span>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Spotify Connection */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                🎵
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Connexion Spotify</h3>
                <p className="text-sm text-gray-600">
                  {spotifyConnected 
                    ? 'Spotify connecté - vos enfants peuvent écouter de la musique'
                    : 'Connectez Spotify pour permettre l\'écoute de musique'
                  }
                </p>
              </div>
            </div>
            {!spotifyConnected ? (
              <button
                onClick={connectSpotify}
                className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Connecter Spotify
              </button>
            ) : (
              <div className="px-6 py-3 bg-green-100 text-green-700 rounded-xl font-semibold">
                ✅ Connecté
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/parent/children"
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                👨‍👩‍👧‍👦
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enfants</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gérez les profils de vos enfants
              </p>
              <div className="text-2xl font-bold text-blue-600">{children.length}</div>
            </div>
          </Link>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                📅
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Playlists</h3>
              <p className="text-sm text-gray-600 mb-4">
                Playlists hebdomadaires
              </p>
              <div className="text-2xl font-bold text-purple-600">3</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                ⚙️
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Paramètres</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contrôles parentaux
              </p>
              <div className="text-2xl font-bold text-orange-600">🛡️</div>
            </div>
          </div>
        </div>

        {/* Children Section */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Vos enfants</h2>
            <Link
              to="/parent/children"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              + Ajouter un enfant
            </Link>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">👶</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Aucun enfant configuré</h3>
              <p className="text-gray-600 mb-6">
                Ajoutez le profil de votre premier enfant pour commencer
              </p>
              <Link
                to="/parent/children"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-semibold transition-colors"
              >
                + Ajouter mon premier enfant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map(child => (
                <div key={child.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{child.emoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        Créé le {new Date(child.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}