import { useState, useEffect } from 'react'
import { Play, Music, Clock, Users } from 'lucide-react'
import { getChildSession } from '../utils/child-auth'
import { supabase } from '../lib/supabase'

interface Playlist {
  id: string
  title: string
  description?: string
  cover_url?: string
  track_count?: number
}

export default function ChildPlaylists() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
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
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      // Load public playlists suitable for children
      const { data, error } = await supabase
        .from('playlists')
        .select(`
          id,
          title,
          description,
          cover_url,
          playlist_tracks(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      const playlistsWithCount = data?.map(playlist => ({
        ...playlist,
        track_count: playlist.playlist_tracks?.length || 0
      })) || []

      setPlaylists(playlistsWithCount)
    } catch (error) {
      console.error('Failed to load playlists:', error)
      setError('Erreur lors du chargement des playlists')
    } finally {
      setIsLoading(false)
    }
  }

  const playPlaylist = async (playlistId: string) => {
    try {
      // This would integrate with your player to start the playlist
      console.log('Playing playlist:', playlistId)
      // Navigate to player with playlist context
      window.location.href = `/player?playlist=${playlistId}`
    } catch (error) {
      console.error('Play playlist error:', error)
    }
  }

  if (!childSession) {
    return <div className="text-center">Chargement...</div>
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          🎵 Mes Playlists
        </h1>
        <p className="text-gray-600">
          Découvre tes playlists favorites, {childSession.child.name} {childSession.child.emoji}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {playlists.length === 0 ? (
        <div className="text-center py-12">
          <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune playlist disponible
          </h3>
          <p className="text-gray-600">
            Demande à tes parents d'ajouter des playlists pour toi !
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist) => (
            <div
              key={playlist.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 relative">
                {playlist.cover_url ? (
                  <img
                    src={playlist.cover_url}
                    alt={playlist.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music className="w-16 h-16 text-white opacity-80" />
                  </div>
                )}
                <button
                  onClick={() => playPlaylist(playlist.id)}
                  className="absolute bottom-4 right-4 w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                >
                  <Play className="w-6 h-6 ml-0.5" />
                </button>
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 truncate">
                  {playlist.title}
                </h3>
                {playlist.description && (
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {playlist.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Music className="w-3 h-3" />
                    {playlist.track_count} titres
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Patou
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}