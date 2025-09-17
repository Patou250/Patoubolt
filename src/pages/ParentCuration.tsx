import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, RefreshCw, Music, Calendar, Users, Upload, ExternalLink } from 'lucide-react'
import { generatePlaylistForBand, getPlaylistsByBand, publishPlaylistToSpotify } from '../services/playlistService'

interface Playlist {
  id: string
  band: string
  year: number
  iso_week: number
  status?: string
  spotify_playlist_id?: string
  created_at: string
  playlist_tracks: Array<{
    position: number
    tracks: {
      id: string
      spotify_id: string
      title: string
      artist: string
      duration_ms: number
      cover_url?: string
    }
  }>
}

export default function ParentCuration() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState<string | null>(null)
  const [publishing, setPublishing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const bands = [
    { id: '4_6', label: '4-6 ans', color: 'bg-green-100 text-green-800' },
    { id: '7_10', label: '7-10 ans', color: 'bg-blue-100 text-blue-800' },
    { id: '10_16', label: '10-16 ans', color: 'bg-purple-100 text-purple-800' }
  ]

  useEffect(() => {
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getPlaylistsByBand()
      setPlaylists(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePlaylist = async (band: '4_6' | '7_10' | '10_16') => {
    try {
      setGenerating(band)
      setError(null)
      
      const result = await generatePlaylistForBand(band)
      
      if (result.success) {
        await loadPlaylists() // Reload to show new playlist
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la génération')
    } finally {
      setGenerating(null)
    }
  }

  const handlePublishPlaylist = async (playlistId: string) => {
    try {
      setPublishing(playlistId)
      setError(null)
      
      const result = await publishPlaylistToSpotify(playlistId)
      
      if (result.success) {
        await loadPlaylists() // Reload to show updated status
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la publication')
    } finally {
      setPublishing(null)
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getBandInfo = (band: string) => {
    return bands.find(b => b.id === band) || { label: band, color: 'bg-gray-100 text-gray-800' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Chargement des playlists...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/parent/dashboard" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">📅 Curation des playlists</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Generation Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Générer une nouvelle playlist</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {bands.map(band => (
              <button
                key={band.id}
                onClick={() => handleGeneratePlaylist(band.id as '4_6' | '7_10' | '10_16')}
                disabled={generating === band.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-600" />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{band.label}</div>
                    <div className="text-sm text-gray-500">Playlist hebdomadaire</div>
                  </div>
                </div>
                
                {generating === band.id ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-gray-400" />
                ) : (
                  <Plus className="w-5 h-5 text-gray-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Playlists List */}
        <div className="space-y-6">
          {playlists.length === 0 ? (
            <div className="bg-white rounded-lg shadow-lg p-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucune playlist générée</h3>
              <p className="text-gray-600">Commencez par générer une playlist pour une tranche d'âge</p>
            </div>
          ) : (
            playlists.map(playlist => {
              const bandInfo = getBandInfo(playlist.band)
              const trackCount = playlist.playlist_tracks?.length || 0
              const totalDuration = playlist.playlist_tracks?.reduce((acc, pt) => acc + (pt.tracks?.duration_ms || 0), 0) || 0
              
              return (
                <div key={playlist.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Music className="w-6 h-6 text-primary" />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Semaine {playlist.iso_week} - {playlist.year}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bandInfo.color}`}>
                              {bandInfo.label}
                            </span>
                            <span className="text-sm text-gray-500">
                              {trackCount} pistes • {formatDuration(totalDuration)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Créée le {new Date(playlist.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                      
                    <div className="flex items-center gap-2 mt-2">
                      {playlist.status === 'published' && playlist.spotify_playlist_id && (
                        <a
                          href={`https://open.spotify.com/playlist/${playlist.spotify_playlist_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium hover:bg-green-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Publiée sur Spotify
                        </a>
                      )}
                      
                      {(!playlist.status || playlist.status === 'draft') && (
                        <button
                          onClick={() => handlePublishPlaylist(playlist.id)}
                          disabled={publishing === playlist.id}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium hover:bg-blue-200 transition-colors disabled:opacity-50"
                        >
                          {publishing === playlist.id ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : (
                            <Upload className="w-3 h-3" />
                          )}
                          {publishing === playlist.id ? 'Publication...' : 'Publier sur Spotify'}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {playlist.playlist_tracks && playlist.playlist_tracks.length > 0 && (
                    <div className="p-6">
                      <h4 className="font-medium text-gray-900 mb-3">Aperçu des pistes</h4>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {playlist.playlist_tracks
                          .sort((a, b) => a.position - b.position)
                          .slice(0, 10)
                          .map((pt, index) => (
                            <div key={pt.tracks?.id || index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                              <div className="w-6 text-center text-sm text-gray-500">
                                {pt.position}
                              </div>
                              {pt.tracks?.cover_url && (
                                <img 
                                  src={pt.tracks.cover_url} 
                                  alt={pt.tracks.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {pt.tracks?.title || 'Titre inconnu'}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {pt.tracks?.artist || 'Artiste inconnu'}
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {pt.tracks?.duration_ms ? formatDuration(pt.tracks.duration_ms) : '--:--'}
                              </div>
                            </div>
                          ))}
                        
                        {playlist.playlist_tracks.length > 10 && (
                          <div className="text-center text-sm text-gray-500 py-2">
                            ... et {playlist.playlist_tracks.length - 10} autres pistes
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}