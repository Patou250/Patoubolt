import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Shield, Clock, Volume2, Ban, Users, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'

interface ParentSettingsData {
  allowed_hours: Record<string, { start: string; end: string }>
  max_daily_minutes: number
  block_explicit: boolean
}

interface ExcludedTrack {
  id: string
  spotify_id: string
  name: string
  artist: string
  excluded_at: string
  reason?: string
}

export default function ParentSettings() {
  const [settings, setSettings] = useState<ParentSettingsData>({
    allowed_hours: {
      monday: { start: '08:00', end: '20:00' },
      tuesday: { start: '08:00', end: '20:00' },
      wednesday: { start: '08:00', end: '20:00' },
      thursday: { start: '08:00', end: '20:00' },
      friday: { start: '08:00', end: '20:00' },
      saturday: { start: '08:00', end: '21:00' },
      sunday: { start: '08:00', end: '21:00' }
    },
    max_daily_minutes: 60,
    block_explicit: true
  })
  const [excludedTracks, setExcludedTracks] = useState<ExcludedTrack[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadSettings()
    loadExcludedTracks()
  }, [])

  const loadSettings = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('parent_settings')
        .select('*')
        .eq('parent_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading settings:', error)
        return
      }

      if (data) {
        setSettings({
          allowed_hours: data.allowed_hours || settings.allowed_hours,
          max_daily_minutes: data.max_daily_minutes || 60,
          block_explicit: data.block_explicit ?? true
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const loadExcludedTracks = () => {
    const excludedRaw = localStorage.getItem('patou_excluded_tracks')
    if (excludedRaw) {
      setExcludedTracks(JSON.parse(excludedRaw))
    }
  }

  const saveSettings = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('Utilisateur non connecté')
        return
      }

      const { error } = await supabase
        .from('parent_settings')
        .upsert({
          parent_id: user.id,
          allowed_hours: settings.allowed_hours,
          max_daily_minutes: settings.max_daily_minutes,
          block_explicit: settings.block_explicit,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error saving settings:', error)
        setMessage('Erreur lors de la sauvegarde')
        return
      }

      setMessage('✅ Paramètres sauvegardés')
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const handleReintegrateTrack = (excludedTrack: ExcludedTrack) => {
    const updatedExcluded = excludedTracks.filter(track => track.id !== excludedTrack.id)
    setExcludedTracks(updatedExcluded)
    localStorage.setItem('patou_excluded_tracks', JSON.stringify(updatedExcluded))

    console.log('✅ Titre réintégré:', excludedTrack.name)
    setMessage('✅ Chanson réintégrée dans les playlists')
    setTimeout(() => setMessage(null), 3000)
  }

  const updateAllowedHours = (day: string, field: 'start' | 'end', value: string) => {
    setSettings(prev => ({
      ...prev,
      allowed_hours: {
        ...prev.allowed_hours,
        [day]: {
          ...prev.allowed_hours[day],
          [field]: value
        }
      }
    }))
  }

  const days = [
    { key: 'monday', label: 'Lundi' },
    { key: 'tuesday', label: 'Mardi' },
    { key: 'wednesday', label: 'Mercredi' },
    { key: 'thursday', label: 'Jeudi' },
    { key: 'friday', label: 'Vendredi' },
    { key: 'saturday', label: 'Samedi' },
    { key: 'sunday', label: 'Dimanche' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/dashboard-parent" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">⚙️ Paramètres Parent</h1>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Horaires autorisés */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-protect" />
              <h2 className="text-lg font-semibold text-gray-800">Horaires autorisés</h2>
            </div>
            
            <div className="space-y-3">
              {days.map(day => (
                <div key={day.key} className="flex items-center gap-3">
                  <div className="w-20 text-sm font-medium text-gray-700">
                    {day.label}
                  </div>
                  <input
                    type="time"
                    value={settings.allowed_hours[day.key]?.start || '08:00'}
                    onChange={(e) => updateAllowedHours(day.key, 'start', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                  <span className="text-gray-500">à</span>
                  <input
                    type="time"
                    value={settings.allowed_hours[day.key]?.end || '20:00'}
                    onChange={(e) => updateAllowedHours(day.key, 'end', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Limites d'écoute */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-5 h-5 text-protect" />
              <h2 className="text-lg font-semibold text-gray-800">Limites d'écoute</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Durée maximale par jour (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={settings.max_daily_minutes}
                  onChange={(e) => setSettings(prev => ({ ...prev, max_daily_minutes: parseInt(e.target.value) || 60 }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Recommandé : 60-120 minutes selon l'âge
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="block-explicit"
                  checked={settings.block_explicit}
                  onChange={(e) => setSettings(prev => ({ ...prev, block_explicit: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="block-explicit" className="text-sm font-medium text-gray-700">
                  Bloquer le contenu explicite
                </label>
              </div>
            </div>
          </div>

          {/* Chansons exclues */}
          <div className="bg-white rounded-lg shadow-lg p-6 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Ban className="w-5 h-5 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-800">Chansons exclues</h2>
            </div>
            
            {excludedTracks.length === 0 ? (
              <div className="text-center py-8">
                <Ban className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune exclusion</h3>
                <p className="text-gray-600">
                  Les chansons que vous excluez depuis le lecteur apparaîtront ici
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {excludedTracks.map(track => (
                  <div key={track.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{track.name}</h4>
                      <p className="text-sm text-gray-600">{track.artist}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Exclu le {new Date(track.excluded_at).toLocaleDateString('fr-FR')}
                        {track.reason && ` • ${track.reason}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReintegrateTrack(track)}
                        className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium transition-colors text-sm"
                      >
                        Réintégrer
                      </button>
                      <button
                        onClick={() => {
                          const updated = excludedTracks.filter(t => t.id !== track.id)
                          setExcludedTracks(updated)
                          localStorage.setItem('patou_excluded_tracks', JSON.stringify(updated))
                        }}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={saveSettings}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Sauvegarde...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Sauvegarder les paramètres
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}