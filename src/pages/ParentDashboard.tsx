import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { 
  Music, Users, Settings, Shield, LogOut, Plus, Calendar, BarChart3
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import type { Child } from '../types/child'

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [user, setUser] = useState<any>(null)
  const navigate = useNavigate()

  useEffect(() => {
    console.log('🔄 ParentDashboard loading...')
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      // Vérifier l'authentification Supabase
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        console.log('❌ No authenticated user, checking session...')
        
        // Fallback: vérifier session localStorage
        const sessionRaw = localStorage.getItem('patou_parent_session')
        if (!sessionRaw) {
          console.log('❌ No session found, redirecting to login')
          navigate('/parent/login')
          return
        }
        
        const session = JSON.parse(sessionRaw)
        setUser(session.parent)
        console.log('✅ Using session data:', session.parent.email)
      } else {
        setUser(user)
        console.log('✅ Authenticated user:', user.email)
      }

      // Vérifier connexion Spotify
      const tokens = getSpotifyTokens()
      setSpotifyConnected(!!tokens)
      console.log('🎵 Spotify connected:', !!tokens)

      // Charger les enfants
      if (user) {
        await loadChildren(user.id)
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error)
      navigate('/parent/login')
    } finally {
      setIsLoading(false)
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
    
    console.log('📡 Edge Function URL:', authUrl)
    
    fetch(authUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      console.log('📡 Auth response status:', res.status)
      return res.json()
    })
    .then(data => {
      console.log('✅ Auth response:', data)
      if (data.authorize_url) {
        localStorage.setItem('spotify_auth_state', data.state)
        console.log('🚀 Redirecting to Spotify auth...')
        window.location.href = data.authorize_url
      } else {
        console.error('❌ No authorize_url in response:', data)
        alert('Erreur de connexion Spotify: ' + (data.error || 'Réponse invalide'))
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
      localStorage.removeItem('patou_parent_session')
      localStorage.removeItem('spotify_tokens')
      navigate('/parent/login')
    } catch (error) {
      console.error('❌ Logout error:', error)
      // Force logout même en cas d'erreur
      localStorage.clear()
      navigate('/parent/login')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement du tableau de bord...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/patou-logo.svg" alt="Patou" className="h-8 w-auto" />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Tableau de bord
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-gray-600">
                {user?.email || 'Utilisateur'}
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white/50 rounded-lg transition-all"
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
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Connexion Spotify</h3>
                <p className="text-sm text-gray-600">
                  {spotifyConnected 
                    ? 'Spotify est connecté - vos enfants peuvent écouter de la musique'
                    : 'Connectez Spotify pour permettre à vos enfants d\'écouter de la musique'
                  }
                </p>
              </div>
            </div>
            {!spotifyConnected ? (
              <button
                onClick={connectSpotify}
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold px-6 py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
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

        {/* Navigation principale */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Enfants */}
          <Link
            to="/parent/children"
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Enfants</h3>
              <p className="text-sm text-gray-600 mb-4">
                Gérez les profils de vos enfants
              </p>
              <div className="text-2xl font-bold text-blue-600">{children.length}</div>
            </div>
          </Link>

          {/* Playlists */}
          <Link
            to="/parent/curation"
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Calendar className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Curation</h3>
              <p className="text-sm text-gray-600 mb-4">
                Playlists hebdomadaires
              </p>
              <div className="text-2xl font-bold text-purple-600">3</div>
            </div>
          </Link>

          {/* Paramètres */}
          <Link
            to="/parent/settings"
            className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Settings className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Paramètres</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contrôles parentaux
              </p>
              <div className="text-2xl font-bold text-orange-600">⚙️</div>
            </div>
          </Link>

          {/* Insights */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 hover:scale-105 transition-all group cursor-pointer">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Insights</h3>
              <p className="text-sm text-gray-600 mb-4">
                Statistiques d'écoute
              </p>
              <div className="text-2xl font-bold text-green-600">📊</div>
            </div>
          </div>
        </div>

        {/* Section enfants */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 border border-white/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">👨‍👩‍👧‍👦 Vos enfants</h2>
            <Link
              to="/parent/children"
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors"
            >
              <Plus className="w-4 h-4" />
              Ajouter un enfant
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
                <Plus className="w-5 h-5" />
                Ajouter mon premier enfant
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map(child => (
                <div key={child.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{child.emoji}</div>
                      <div>
                        <h3 className="font-bold text-gray-900">{child.name}</h3>
                        <p className="text-sm text-gray-600">
                          Créé le {new Date(child.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/parent/children"
                      className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Gérer
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-4 text-center border border-white/20">
            <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{children.length}</div>
            <div className="text-sm text-gray-600">Enfants</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-4 text-center border border-white/20">
            <Music className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">3</div>
            <div className="text-sm text-gray-600">Playlists</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-4 text-center border border-white/20">
            <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">1,247</div>
            <div className="text-sm text-gray-600">Pistes vérifiées</div>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-4 text-center border border-white/20">
            <BarChart3 className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">42h</div>
            <div className="text-sm text-gray-600">Heures d'écoute</div>
          </div>
        </div>
      </div>
    </div>
  )
}