import { useEffect, useState } from 'react'
import { Check, X, RefreshCw, AlertTriangle } from 'lucide-react'
import { getTracksInReview, createOverride } from '../services/moderationService'

interface ModerationEvent {
  id: string
  spotify_track_id: string
  decision: string
  rules_fired: string[]
  track_metadata: {
    name: string
    artist: string
    explicit: boolean
  }
  created_at: string
}

export default function AdminModeration() {
  const [tracks, setTracks] = useState<ModerationEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadTracks = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getTracksInReview()
      setTracks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracks()
  }, [])

  const handleAction = async (trackId: string, spotifyId: string, action: 'allow' | 'block') => {
    try {
      setActionLoading(trackId)
      
      await createOverride(
        'global',
        'spotify_track',
        spotifyId
      )
      
      // Remove from list
      setTracks(tracks.filter(t => t.id !== trackId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'action')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Chargement des pistes en révision...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Modération des pistes</h1>
              <p className="text-gray-600 mt-2">
                Gérez les pistes en attente de révision manuelle
              </p>
            </div>
            <button
              onClick={loadTracks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {tracks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune piste en révision
            </h3>
            <p className="text-gray-600">
              Toutes les pistes ont été traitées ou aucune modération n'est en attente.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {tracks.length} piste{tracks.length > 1 ? 's' : ''} en révision
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Piste
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Raisons
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tracks.map((track) => (
                    <tr key={track.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {track.track_metadata?.name || 'Titre inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {track.track_metadata?.artist || 'Artiste inconnu'}
                          </div>
                          {track.track_metadata?.explicit && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 mt-1">
                              Explicite
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {track.rules_fired.map((rule, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-1"
                            >
                              {rule}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(track.created_at).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleAction(track.id, track.spotify_track_id, 'allow')}
                            disabled={actionLoading === track.id}
                            className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm"
                          >
                            <Check className="w-4 h-4" />
                            Autoriser
                          </button>
                          <button
                            onClick={() => handleAction(track.id, track.spotify_track_id, 'block')}
                            disabled={actionLoading === track.id}
                            className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm"
                          >
                            <X className="w-4 h-4" />
                            Bloquer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}