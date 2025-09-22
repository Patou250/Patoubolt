import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Music, Users, Settings, Shield, LogOut, Plus, X
} from 'lucide-react'
import PatouCard, { CardPatterns } from '../components/ui/PatouCard'
import PatouButton, { ButtonPatterns } from '../components/ui/PatouButton'
import { useAuth } from '../contexts/AuthContext'
import { getParentSession, clearParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'

interface Playlist {
  id: string
  name: string
  description?: string
  tracks: string[]
  created_at: string
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const navigate = useNavigate()
  const { user, signOut } = useAuth()

  useEffect(() => {
    console.log('🔄 ParentDashboard useEffect - checking auth...')
    
    // Si on accède via /direct/parent, créer une session factice
    if (window.location.pathname === '/direct/parent') {
      console.log('🧪 Direct access mode - creating fake session')
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

    console.log('🔍 Checking for Spotify tokens...')
    const tokens = getSpotifyTokens()
    
    // Si on a des tokens Spotify, créer une session
    if (tokens) {
      console.log('✅ Spotify tokens found, fetching user profile...')
      fetch('https://api.spotify.com/v1/me', {
        headers: { 'Authorization': `Bearer ${tokens.access_token}` }
      })
      .then(res => res.json())
      .then(user => {
        console.log('✅ Spotify user profile loaded:', user.email)
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
      })
      .catch(() => {
        console.error('❌ Failed to load Spotify user profile')
        navigate('/')
      })
      return
    }
    
    // Vérifier s'il y a une session parent
    console.log('🔍 Checking for parent session...')
    const session = getParentSession()
    if (!session && !tokens) {
      console.log('❌ No session or tokens found, redirecting to login')
      navigate('/login-parent')
      return
    }

    if (session) {
      console.log('✅ Parent session found:', session.parent.email)
      checkSpotifyConnection()
      loadChildren(session)
      loadPlaylists()
    }
  }, [navigate])

  const checkSpotifyConnection = () => {
    const tokens = getSpotifyTokens()
    setSpotifyConnected(!!tokens)
  }

  const loadChildren = async (session: any) => {
    try {
      console.log('👶 Loading children for parent...')
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        console.log('❌ No authenticated user found')
        return
      }
      
      console.log('🔍 Checking for existing profile...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('📝 Creating new profile...')
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
          console.error('❌ Error creating profile:', createError)
          return
        }
        
        console.log('📋 Loading children for new profile...')
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', newProfile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        console.log('✅ Children loaded:', data?.length || 0)
        setChildren(data || [])
      } else {
        console.log('📋 Loading children for existing profile...')
        const { data, error } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', profile.id)
          .order('created_at', { ascending: true })

        if (error) throw error
        console.log('✅ Children loaded:', data?.length || 0)
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
      const mockPlaylists: Playlist[] = []
      setPlaylists(mockPlaylists)
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

  const connectSpotify = () => {
    console.log('🔗 Starting Spotify auth via Edge Function...')
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const authUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=login`
    
    console.log('📡 Edge Function URL:', authUrl)
    
    fetch(authUrl, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json'
      }
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Edge Function response:', data)
      if (data.authorize_url) {
        localStorage.setItem('spotify_auth_state', data.state)
        console.log('🚀 Redirecting to Spotify:', data.authorize_url)
        window.location.href = data.authorize_url
      } else {
        console.error('❌ No authorize_url in response:', data)
        alert('Erreur: ' + (data.error || 'Réponse invalide'))
      }
    })
    .catch(error => {
      console.error('❌ Edge Function error:', error)
      alert('Erreur de connexion: ' + error.message)
    })
  }

  const handleSignOut = () => {
    signOut()
    navigate('/parent/login')
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
    <div className="min-h-screen bg-background-page">
      {/* Header - reproduction exacte WeWeb */}
      <header className="glass-effect sticky top-0 z-50 border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/patou-logo.svg" alt="Patou" className="h-8 w-auto transition-transform duration-300 hover:scale-110" />
              <h1 className="text-2xl font-bold text-gradient-patou">Tableau de bord</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <PatouButton
                variant="ghost"
                onClick={handleSignOut}
                icon={<LogOut className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">Déconnexion</span>
              </PatouButton>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Connexion Spotify - reproduction exacte WeWeb */}
        <PatouCard variant="bento" className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" animation="slideUp">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center animate-bounce-gentle">
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
              <PatouButton
                variant="primary"
                onClick={connectSpotify}
              >
                Connecter
              </PatouButton>
            ) : (
              <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium animate-pulse">
                Connecté
              </div>
            )}
          </div>
        </PatouCard>

        {/* 3 sections principales - reproduction exacte WeWeb */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {/* Enfants */}
          <CardPatterns.Feature
            icon={<Users className="w-6 h-6 text-protect" />}
            title="Enfants"
            description="Gérez les profils de vos enfants et leurs préférences musicales"
            action={
              <PatouButton
                variant="outline"
                onClick={() => navigate('/parent/children')}
                className="w-full"
              >
                Voir les profils
              </PatouButton>
            }
          />

          {/* Playlists enfants */}
          <CardPatterns.Feature
            icon={<Music className="w-6 h-6 text-share" />}
            title="Playlists enfants"
            description="Explorez et gérez les playlists adaptées à vos enfants"
            action={
              <PatouButton
                variant="outline"
                onClick={() => navigate('/parent/curation')}
                className="w-full"
              >
                Voir les playlists
              </PatouButton>
            }
          />

          {/* Règles & Filtres */}
          <CardPatterns.Feature
            icon={<Shield className="w-6 h-6 text-awaken-dark" />}
            title="Règles & Filtres"
            description="Configurez les filtres de contrôle et les règles d'écoute"
            action={
              <>
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-gray-600">Niveau de vigilance</span>
                    <span className="text-awaken-dark font-medium">80%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-awaken h-2 rounded-full transition-all" style={{ width: '80%' }}></div>
                  </div>
                </div>
                <PatouButton
                  variant="outline"
                  onClick={() => navigate('/parent/settings')}
                  className="w-full"
                >
                  Configurer
                </PatouButton>
              </>
            }
          />
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <CardPatterns.Stats
            icon={<Users className="w-6 h-6 text-protect" />}
            label="Enfants"
            value={children.length}
            trend="neutral"
          />
          <CardPatterns.Stats
            icon={<Music className="w-6 h-6 text-share" />}
            label="Playlists"
            value={playlists.length}
            trend="up"
          />
          <CardPatterns.Stats
            icon={<Shield className="w-6 h-6 text-awaken-dark" />}
            label="Pistes vérifiées"
            value="1,247"
            trend="up"
          />
          <CardPatterns.Stats
            icon={<Music className="w-6 h-6 text-primary" />}
            label="Heures d'écoute"
            value="42h"
            trend="neutral"
          />
        </div>

        {/* Enfants récents */}
        {children.length > 0 && (
          <PatouCard className="mb-8" animation="slideUp" animationDelay="0.6s">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Enfants récents</h2>
              <PatouButton
                variant="ghost"
                size="sm"
                onClick={() => navigate('/parent/children')}
              >
                Voir tout
              </PatouButton>
            </div>
            <div className="space-y-3">
              {children.slice(0, 3).map((child) => (
                <CardPatterns.Child
                  key={child.id}
                  emoji={child.emoji}
                  name={child.name}
                  stats={`Créé le ${new Date(child.created_at).toLocaleDateString('fr-FR')}`}
                  actions={
                    <PatouButton
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/parent/children')}
                    >
                      Gérer
                    </PatouButton>
                  }
                />
              ))}
            </div>
          </PatouCard>
        )}
      </div>
    </div>
  )
}