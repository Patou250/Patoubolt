import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Music, Users, Settings, BarChart3, History, 
  Plus, Edit2, Shield, LogOut, User, Clock,
  Play, Pause, SkipBack, SkipForward, Volume2
} from 'lucide-react'
import { getParentSession, clearParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'
import styles from './ParentDashboard.module.css'

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([])
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