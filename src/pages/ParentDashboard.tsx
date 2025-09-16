import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Music, Users, Settings, BarChart3, History, Heart,
  Plus, Edit2, Shield, LogOut, AlertCircle, Clock, Calendar
} from 'lucide-react'
import { getParentSession, clearParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'
import styles from './ParentDashboard.module.css'

interface KPIData {
  spotify_connected: boolean
  children_count: number
  listens_7d: number
  favorites_7d: number
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
  const [kpis, setKpis] = useState<KPIData>({
    spotify_connected: false,
    children_count: 0,
    listens_7d: 0,
    favorites_7d: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [spotifyConnected, setSpotifyConnected] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const session = getParentSession()
    if (!session) {
      navigate('/parent/login')
      return
    }

    checkSpotifyConnection()
    loadChildren()
    loadKPIs()
  }, [navigate])

  const checkSpotifyConnection = () => {
    const tokens = getSpotifyTokens()
    setSpotifyConnected(!!tokens)
  }

  const loadChildren = async () => {
    try {
      const session = getParentSession()
      if (!session) return

      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', session.parent.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setChildren(data || [])
    } catch (error) {
      console.error('Failed to load children:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadKPIs = async () => {
    try {
      const session = getParentSession()
      if (!session) return

      // Spotify connected
      const tokens = getSpotifyTokens()
      const spotify_connected = !!tokens

      // Children count
      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', session.parent.id)

      if (childrenError) throw childrenError
      const children_count = childrenData?.length || 0
      const childrenIds = childrenData?.map(c => c.id) || []

      // Listens last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const { data: listensData, error: listensError } = await supabase
        .from('play_history')
        .select('id')
        .in('child_id', childrenIds)
        .gte('started_at', sevenDaysAgo.toISOString())

      if (listensError) throw listensError
      const listens_7d = listensData?.length || 0

      // Favorites last 7 days
      const { data: favoritesData, error: favoritesError } = await supabase
        .from('favorites')
        .select('id')
        .in('child_id', childrenIds)
        .gte('created_at', sevenDaysAgo.toISOString())

      if (favoritesError) throw favoritesError
      const favorites_7d = favoritesData?.length || 0

      setKpis({
        spotify_connected,
        children_count,
        listens_7d,
        favorites_7d
      })
    } catch (error) {
      console.error('Failed to load KPIs:', error)
      // Set default values on error
      const tokens = getSpotifyTokens()
      setKpis({
        spotify_connected: !!tokens,
        children_count: children.length,
        listens_7d: 0,
        favorites_7d: 0
      })
    }
  }

  const handleSignOut = () => {
    clearParentSession()
    navigate('/parent/login')
  }

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
    { id: 'children', label: 'Enfants', icon: Users },
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
              {/* KPIs Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    kpis.spotify_connected ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <Music className={`w-6 h-6 ${
                      kpis.spotify_connected ? 'text-green-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {kpis.spotify_connected ? 'Connecté' : 'Déconnecté'}
                  </div>
                  <div className="text-sm text-gray-600">Spotify</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {kpis.children_count}
                  </div>
                  <div className="text-sm text-gray-600">Enfants</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {kpis.listens_7d}
                  </div>
                  <div className="text-sm text-gray-600">Écoutes 7j</div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Heart className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">
                    {kpis.favorites_7d}
                  </div>
                  <div className="text-sm text-gray-600">Favoris 7j</div>
                </div>
              </div>

              {/* Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <button
                  onClick={() => navigate('/parent/children')}
                  className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Créer un enfant
                  </h3>
                  <p className="text-sm text-gray-600">
                    Ajouter un nouveau profil enfant avec ses règles
                  </p>
                </button>

                <button
                  onClick={() => navigate('/parent/rules/choose')}
                  className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                    <Clock className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Régler les horaires
                  </h3>
                  <p className="text-sm text-gray-600">
                    Configurer les créneaux d'écoute autorisés
                  </p>
                </button>

                <button
                  onClick={() => navigate('/parent/curation')}
                  className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Publier la playlist semaine
                  </h3>
                  <p className="text-sm text-gray-600">
                    Activer les nouvelles playlists pour vos enfants
                  </p>
                </button>
              </div>

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

              {!spotifyConnected && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 mb-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-orange-800 mb-1">
                        Spotify non connecté
                      </h3>
                      <p className="text-sm text-orange-700 mb-3">
                        Connectez votre compte Spotify Premium pour utiliser toutes les fonctionnalités.
                      </p>
                      <button
                        onClick={() => navigate('/parent/login')}
                        className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm"
                      >
                        Connecter Spotify
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className={styles.childrenGrid}>
                {children.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Aucun enfant configuré
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Ajoutez le premier profil de votre enfant pour commencer
                    </p>
                    <button
                      onClick={() => navigate('/parent/children')}
                      className={styles.primaryButton}
                    >
                      <Plus size={16} />
                      Ajouter un enfant
                    </button>
                  </div>
                ) : (
                  children.map(child => (
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
                          title="Configurer les règles"
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
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'children' && (
            <div>
              <div className={styles.tabHeader}>
                <h2>Gestion des enfants</h2>
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
              </div>
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
                        onClick={() => navigate('/parent/login')}
                        className={styles.primaryButton}
                      >
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
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}