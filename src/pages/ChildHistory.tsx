import { useState, useEffect } from 'react'
import { Clock, Music, Heart, Play } from 'lucide-react'
import { getChildSession } from '../utils/child-auth'
import { supabase } from '../lib/supabase'

interface HistoryEntry {
  id: string
  track_id: string
  started_at: string
  duration_sec: number
  track_name?: string
  artist_name?: string
  album_name?: string
}

export default function ChildHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [childSession, setChildSession] = useState<any>(null)

  useEffect(() => {
    const session = getChildSession()
    if (!session) {
      window.location.href = '/child/login'
      return
    }
    setChildSession(session)
    loadHistory(session.childId)
  }, [])

  const loadHistory = async (childId: string) => {
    try {
      const { data, error } = await supabase
        .from('play_history')
        .select('*')
        .eq('child_id', childId)
        .order('started_at', { ascending: false })
        .limit(50)

      if (error) throw error

      setHistory(data || [])
    } catch (error) {
      console.error('Failed to load history:', error)
      setError('Erreur lors du chargement de l\'historique')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 1) {
      return 'Il y a quelques minutes'
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)} heure${Math.floor(diffInHours) > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const playTrack = async (trackId: string) => {
    try {
      // This would integrate with your player
      console.log('Playing track:', trackId)
      window.location.href = `/player?track=${trackId}`
    } catch (error) {
      console.error('Play error:', error)
    }
  }

  if (!childSession) {
    return <div className="text-center">Chargement...</div>
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          📚 Mon Historique
        </h1>
        <p className="text-gray-600">
          Retrouve toutes les chansons que tu as écoutées, {childSession.child.name} {childSession.child.emoji}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {history.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun historique
          </h3>
          <p className="text-gray-600">
            Commence à écouter de la musique pour voir ton historique ici !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {entry.track_name || `Track ${entry.track_id.slice(-8)}`}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {entry.artist_name || 'Artiste inconnu'}
                </p>
                {entry.album_name && (
                  <p className="text-xs text-gray-500 truncate">
                    {entry.album_name}
                  </p>
                )}
              </div>

              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">
                  {formatDate(entry.started_at)}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {formatDuration(entry.duration_sec)}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => playTrack(entry.track_id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Réécouter"
                >
                  <Play className="w-4 h-4" />
                </button>
                <button
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  title="Ajouter aux favoris"
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            {history.length} chanson{history.length > 1 ? 's' : ''} dans ton historique
          </p>
        </div>
      )}
    </div>
  )
}