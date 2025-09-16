import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Clock, Music, Download } from 'lucide-react'
import { getParentSession } from '../utils/auth'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'
import type { PlayInsights } from '../types/favorites'
import styles from './ParentInsights.module.css'

export default function ParentInsights() {
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChildId, setSelectedChildId] = useState<string>('all')
  const [insights, setInsights] = useState<PlayInsights | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const session = getParentSession()
    if (!session) {
      navigate('/parent/login')
      return
    }

    loadData()
  }, [navigate])

  useEffect(() => {
    if (children.length > 0) {
      loadInsights()
    }
  }, [selectedChildId, children])

  const loadData = async () => {
    try {
      const session = getParentSession()
      if (!session) return

      const { data: childrenData, error: childrenError } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', session.parent.id)
        .order('created_at', { ascending: true })

      if (childrenError) throw childrenError
      setChildren(childrenData || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      setError('Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const loadInsights = async () => {
    try {
      // For demo, create mock insights data
      const mockInsights = {
        total_plays: 42,
        total_duration_minutes: 180,
        top_tracks: [
          { track_id: 'track1', play_count: 8, total_duration_minutes: 32 },
          { track_id: 'track2', play_count: 6, total_duration_minutes: 24 },
          { track_id: 'track3', play_count: 4, total_duration_minutes: 16 }
        ],
        top_artists: [],
        recent_plays: [],
        explicit_content_ratio: 0.05
      }
      setInsights(mockInsights)
    } catch (error) {
      console.error('Failed to load insights:', error)
      setError('Erreur lors du chargement des statistiques')
    }
  }

  const exportToCsv = () => {
    if (!insights) return

    const csvData = [
      ['Type', 'Track ID', 'Play Count', 'Duration (min)'],
      ...insights.top_tracks.map(track => [
        'Track',
        track.track_id,
        track.play_count.toString(),
        track.total_duration_minutes.toString()
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = `patou-insights-${selectedChildId}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loading__spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.insights}>
      <div className="container">
        <div className={styles.insights__content}>
          {/* Header */}
          <div className={styles.insights__header}>
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="btn btn--outline"
            >
              <ArrowLeft className={styles.insights__backIcon} />
              Retour
            </button>
            <div className={styles.insights__title}>
              <h1>Statistiques d'Écoute</h1>
              <p>Analysez les habitudes musicales de vos enfants</p>
            </div>
            <button
              onClick={exportToCsv}
              disabled={!insights}
              className="btn btn--secondary"
            >
              <Download className={styles.insights__exportIcon} />
              Export CSV
            </button>
          </div>

          {error && (
            <div className={styles.insights__error}>
              {error}
            </div>
          )}

          {/* Child Filter */}
          <div className={styles.insights__filter}>
            <label htmlFor="childSelect">Filtrer par enfant :</label>
            <select
              id="childSelect"
              value={selectedChildId}
              onChange={(e) => setSelectedChildId(e.target.value)}
              className={styles.filter__select}
            >
              <option value="all">Tous les enfants</option>
              {children.map((child) => (
                <option key={child.id} value={child.id}>
                  {child.emoji} {child.name}
                </option>
              ))}
            </select>
          </div>

          {insights && (
            <>
              {/* Overview Stats */}
              <div className={styles.insights__overview}>
                <div className={styles.stat__card}>
                  <div className={styles.stat__icon}>
                    <Music className={styles.stat__iconSvg} />
                  </div>
                  <div className={styles.stat__content}>
                    <h3>{insights.total_plays}</h3>
                    <p>Lectures totales</p>
                  </div>
                </div>
                <div className={styles.stat__card}>
                  <div className={styles.stat__icon}>
                    <Clock className={styles.stat__iconSvg} />
                  </div>
                  <div className={styles.stat__content}>
                    <h3>{insights.total_duration_minutes}</h3>
                    <p>Minutes écoutées</p>
                  </div>
                </div>
                <div className={styles.stat__card}>
                  <div className={styles.stat__icon}>
                    <TrendingUp className={styles.stat__iconSvg} />
                  </div>
                  <div className={styles.stat__content}>
                    <h3>{Math.round(insights.explicit_content_ratio * 100)}%</h3>
                    <p>Contenu explicite</p>
                  </div>
                </div>
              </div>

              {/* Top Tracks */}
              <div className={styles.insights__section}>
                <h2>Top Titres</h2>
                <div className={styles.tracks__list}>
                  {insights.top_tracks.length === 0 ? (
                    <p className={styles.empty__message}>Aucune donnée disponible</p>
                  ) : (
                    insights.top_tracks.map((track, index) => (
                      <div key={track.track_id} className={styles.track__item}>
                        <div className={styles.track__rank}>#{index + 1}</div>
                        <div className={styles.track__info}>
                          <h4>Track {track.track_id.slice(-8)}</h4>
                          <p>{track.play_count} lectures • {track.total_duration_minutes} min</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className={styles.insights__section}>
                <h2>Activité Récente</h2>
                <div className={styles.recent__list}>
                  {insights.recent_plays.length === 0 ? (
                    <p className={styles.empty__message}>Aucune activité récente</p>
                  ) : (
                    insights.recent_plays.slice(0, 10).map((play) => (
                      <div key={play.id} className={styles.recent__item}>
                        <div className={styles.recent__info}>
                          <h4>Track {play.track_id.slice(-8)}</h4>
                          <p>
                            {Math.floor(play.duration_sec / 60)}:{(play.duration_sec % 60).toString().padStart(2, '0')} • {' '}
                            {new Date(play.started_at).toLocaleString()}
                          </p>
                        </div>
                        {play.explicit && (
                          <span className={styles.explicit__badge}>E</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}