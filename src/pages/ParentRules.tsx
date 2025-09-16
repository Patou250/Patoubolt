import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Clock, Shield, List, Save } from 'lucide-react'
import { getParentSession } from '../utils/auth'
import { supabase } from '../lib/supabase'
import type { Child } from '../types/child'
import type { ChildRules, TimeWindow } from '../types/rules'
import { RulesEngine } from '../utils/rules-engine'
import styles from './ParentRules.module.css'

const DAYS_OF_WEEK = [
  { value: 0, label: 'Dimanche', short: 'Dim' },
  { value: 1, label: 'Lundi', short: 'Lun' },
  { value: 2, label: 'Mardi', short: 'Mar' },
  { value: 3, label: 'Mercredi', short: 'Mer' },
  { value: 4, label: 'Jeudi', short: 'Jeu' },
  { value: 5, label: 'Vendredi', short: 'Ven' },
  { value: 6, label: 'Samedi', short: 'Sam' }
]

export default function ParentRules() {
  const { childId } = useParams<{ childId: string }>()
  const [child, setChild] = useState<Child | null>(null)
  const [rules, setRules] = useState<ChildRules | null>(null)
  const [usage, setUsage] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  // Form state
  const [timeWindows, setTimeWindows] = useState<TimeWindow[]>([])
  const [dailyQuota, setDailyQuota] = useState(120)
  const [explicitBlock, setExplicitBlock] = useState(true)
  const [whitelistTracks, setWhitelistTracks] = useState('')
  const [whitelistPlaylists, setWhitelistPlaylists] = useState('')

  useEffect(() => {
    const session = getParentSession()
    if (!session) {
      navigate('/parent/login')
      return
    }

    if (!childId || childId === 'choose') {
      navigate('/parent/children')
      return
    }

    loadData()
  }, [navigate, childId])

  const loadData = async () => {
    try {
      // Load child info
      const { data: childData, error: childError } = await supabase
        .from('children')
        .select('*')
        .eq('id', childId)
        .single()

      if (childError || !childData) {
        setError('Enfant non trouvé')
        return
      }

      setChild(childData)

      // Load rules and usage via API
      const session = getParentSession()
      const response = await fetch(`/api/child/rules/${childId}`, {
        headers: {
          'Authorization': `Bearer ${btoa(JSON.stringify(session))}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setRules(data.rules)
        setUsage(data.usage)

        // Initialize form with current rules
        if (data.rules) {
          setTimeWindows(data.rules.time_windows || [])
          setDailyQuota(data.rules.daily_quota_minutes || 120)
          setExplicitBlock(data.rules.explicit_block !== false)
          setWhitelistTracks((data.rules.whitelist_track_ids || []).join('\n'))
          setWhitelistPlaylists((data.rules.whitelist_playlist_ids || []).join('\n'))
        }
      }
    } catch (error: any) {
      console.error('Failed to load data:', error)
      // For now, set default rules since we don't have backend
      setTimeWindows([
        { dow: [1, 2, 3, 4, 5], start: '16:00', end: '19:00' },
        { dow: [0, 6], start: '09:00', end: '20:00' }
      ])
      setDailyQuota(120)
      setExplicitBlock(true)
      setWhitelistTracks('')
      setWhitelistPlaylists('')
    } finally {
      setIsLoading(false)
    }
  }

  const addTimeWindow = () => {
    setTimeWindows([
      ...timeWindows,
      { dow: [1, 2, 3, 4, 5], start: '16:00', end: '19:00' }
    ])
  }

  const updateTimeWindow = (index: number, field: keyof TimeWindow, value: any) => {
    const updated = [...timeWindows]
    updated[index] = { ...updated[index], [field]: value }
    setTimeWindows(updated)
  }

  const removeTimeWindow = (index: number) => {
    setTimeWindows(timeWindows.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      // For now, save rules locally (in production, this would use Supabase)
      const rulesData = {
        time_windows: timeWindows,
        daily_quota_minutes: dailyQuota,
        explicit_block: explicitBlock,
        whitelist_track_ids: whitelistTracks.split('\n').filter(id => id.trim()),
        whitelist_playlist_ids: whitelistPlaylists.split('\n').filter(id => id.trim())
      }
      
      localStorage.setItem(`child_rules_${childId}`, JSON.stringify(rulesData))
      setSuccess('Règles sauvegardées avec succès')
    } catch (error) {
      console.error('Save error:', error)
      setError('Erreur lors de la sauvegarde')
    } finally {
      setIsSaving(false)
    }
  }
  // Si on arrive sur /parent/rules/choose, rediriger vers la sélection d'enfant
  if (childId === 'choose') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <Shield className="w-12 h-12 text-purple-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Choisir un enfant
          </h2>
          <p className="text-gray-600 mb-6">
            Sélectionnez l'enfant pour lequel vous souhaitez configurer les règles
          </p>
          <Link
            to="/parent/children"
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Voir mes enfants
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loading__spinner}></div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className={styles.error}>
        <p>Enfant non trouvé</p>
        <button onClick={() => navigate('/parent/children')} className="btn btn--primary">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className={styles.rules}>
      <div className="container">
        <div className={styles.rules__content}>
          {/* Header */}
          <div className={styles.rules__header}>
            <button
              onClick={() => navigate('/parent/children')}
              className="btn btn--outline"
            >
              <ArrowLeft className={styles.rules__backIcon} />
              Retour
            </button>
            <div className={styles.rules__title}>
              <h1>Règles pour {child.name} {child.emoji}</h1>
              <p>Configurez les restrictions d'écoute</p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn btn--primary"
            >
              <Save className={styles.rules__saveIcon} />
              {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>

          {error && (
            <div className={styles.rules__error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.rules__success}>
              {success}
            </div>
          )}

          {/* Usage Summary */}
          {usage && (
            <div className={styles.rules__usage}>
              <h3>Utilisation aujourd'hui</h3>
              <div className={styles.usage__stats}>
                <div className={styles.usage__stat}>
                  <span className={styles.usage__value}>{usage.minutes_listened || 0}</span>
                  <span className={styles.usage__label}>minutes écoutées</span>
                </div>
                <div className={styles.usage__stat}>
                  <span className={styles.usage__value}>
                    {Math.max(0, dailyQuota - (usage.minutes_listened || 0))}
                  </span>
                  <span className={styles.usage__label}>minutes restantes</span>
                </div>
              </div>
            </div>
          )}

          {/* Rules Form */}
          <div className={styles.rules__form}>
            {/* Time Windows */}
            <div className={styles.form__section}>
              <h3>
                <Clock className={styles.form__sectionIcon} />
                Horaires autorisés
              </h3>
              <div className={styles.timeWindows}>
                {timeWindows.map((window, index) => (
                  <div key={index} className={styles.timeWindow}>
                    <div className={styles.timeWindow__days}>
                      {DAYS_OF_WEEK.map(day => (
                        <label key={day.value} className={styles.dayCheckbox}>
                          <input
                            type="checkbox"
                            checked={window.dow.includes(day.value)}
                            onChange={(e) => {
                              const newDow = e.target.checked
                                ? [...window.dow, day.value]
                                : window.dow.filter(d => d !== day.value)
                              updateTimeWindow(index, 'dow', newDow)
                            }}
                          />
                          <span>{day.short}</span>
                        </label>
                      ))}
                    </div>
                    <div className={styles.timeWindow__times}>
                      <input
                        type="time"
                        value={window.start}
                        onChange={(e) => updateTimeWindow(index, 'start', e.target.value)}
                      />
                      <span>à</span>
                      <input
                        type="time"
                        value={window.end}
                        onChange={(e) => updateTimeWindow(index, 'end', e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeTimeWindow(index)}
                      className={styles.timeWindow__remove}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTimeWindow}
                  className="btn btn--outline"
                >
                  Ajouter une plage horaire
                </button>
              </div>
            </div>

            {/* Daily Quota */}
            <div className={styles.form__section}>
              <h3>
                <Clock className={styles.form__sectionIcon} />
                Quota quotidien
              </h3>
              <div className={styles.quota}>
                <input
                  type="number"
                  min="0"
                  max="480"
                  step="15"
                  value={dailyQuota}
                  onChange={(e) => setDailyQuota(parseInt(e.target.value) || 0)}
                  className={styles.quota__input}
                />
                <span>minutes par jour</span>
              </div>
            </div>

            {/* Explicit Content */}
            <div className={styles.form__section}>
              <h3>
                <Shield className={styles.form__sectionIcon} />
                Contenu explicite
              </h3>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={explicitBlock}
                  onChange={(e) => setExplicitBlock(e.target.checked)}
                />
                <span>Bloquer le contenu explicite</span>
              </label>
            </div>

            {/* Whitelists */}
            <div className={styles.form__section}>
              <h3>
                <List className={styles.form__sectionIcon} />
                Listes autorisées
              </h3>
              <div className={styles.whitelists}>
                <div className={styles.whitelist}>
                  <label>IDs de titres autorisés (un par ligne)</label>
                  <textarea
                    value={whitelistTracks}
                    onChange={(e) => setWhitelistTracks(e.target.value)}
                    placeholder="spotify:track:..."
                    rows={5}
                  />
                </div>
                <div className={styles.whitelist}>
                  <label>IDs de playlists autorisées (un par ligne)</label>
                  <textarea
                    value={whitelistPlaylists}
                    onChange={(e) => setWhitelistPlaylists(e.target.value)}
                    placeholder="spotify:playlist:..."
                    rows={5}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}