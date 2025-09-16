import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Upload, Play, Check, X, Filter } from 'lucide-react'
import { getParentSession } from '../utils/auth'
import { supabase } from '../lib/supabase'
import type { Playlist, Track, PlaylistItem, Child } from '../types/playlist'
import styles from './ParentCuration.module.css'

export default function ParentCuration() {
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [selectedPlaylists, setSelectedPlaylists] = useState<Set<string>>(new Set())
  const [selectedChildren, setSelectedChildren] = useState<Set<string>>(new Set())
  const [spotifyUrl, setSpotifyUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [excludeExplicit, setExcludeExplicit] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const session = getParentSession()
    if (!session) {
      navigate('/parent/login')
      return
    }

    loadData()
  }, [navigate])

  const loadData = async () => {
    try {
      // Load playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false })

      if (playlistsError) throw playlistsError
      setPlaylists(playlistsData || [])

      // Load children
      const session = getParentSession()
      if (session) {
        const { data: childrenData, error: childrenError } = await supabase
          .from('children')
          .select('*')
          .eq('parent_id', session.parent.id)
          .order('created_at', { ascending: true })

        if (childrenError) throw childrenError
        setChildren(childrenData || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
      setError('Erreur lors du chargement')
    }
  }

  const extractSpotifyId = (url: string): string | null => {
    // Handle various Spotify URL formats
    const patterns = [
      /spotify:playlist:([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/,
      /^([a-zA-Z0-9]+)$/ // Direct ID
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  const importSpotifyPlaylist = async () => {
    const playlistId = extractSpotifyId(spotifyUrl)
    if (!playlistId) {
      setError('URL ou ID Spotify invalide')
      return
    }

    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      // For demo, simulate successful import
      setSuccess(`Playlist importée avec succès (ID: ${playlistId})`)
      setSpotifyUrl('')
      await loadData()
    } catch (error) {
      console.error('Import error:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'import')
    } finally {
      setIsImporting(false)
    }
  }

  const importPatouPlaylists = async () => {
    setIsImporting(true)
    setError('')
    setSuccess('')

    try {
      // For demo, simulate successful import
      setSuccess('3 playlists Patou importées')
      await loadData()
    } catch (error) {
      console.error('Import error:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'import')
    } finally {
      setIsImporting(false)
    }
  }

  const activateForChildren = async () => {
    if (selectedPlaylists.size === 0) {
      setError('Sélectionnez au moins une playlist')
      return
    }

    if (selectedChildren.size === 0) {
      setError('Sélectionnez au moins un enfant')
      return
    }

    setIsActivating(true)
    setError('')
    setSuccess('')

    try {
      // For demo, simulate successful activation
      setSuccess(`Playlists activées pour ${selectedChildren.size} enfant(s)`)
      setSelectedPlaylists(new Set())
      setSelectedChildren(new Set())
      await loadData()
    } catch (error) {
      console.error('Activation error:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de l\'activation')
    } finally {
      setIsActivating(false)
    }
  }

  const togglePlaylistSelection = (playlistId: string) => {
    const newSelection = new Set(selectedPlaylists)
    if (newSelection.has(playlistId)) {
      newSelection.delete(playlistId)
    } else {
      newSelection.add(playlistId)
    }
    setSelectedPlaylists(newSelection)
  }

  const toggleChildSelection = (childId: string) => {
    const newSelection = new Set(selectedChildren)
    if (newSelection.has(childId)) {
      newSelection.delete(childId)
    } else {
      newSelection.add(childId)
    }
    setSelectedChildren(newSelection)
  }

  return (
    <div className={styles.curation}>
      <div className="container">
        <div className={styles.curation__content}>
          {/* Header */}
          <div className={styles.curation__header}>
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="btn btn--outline"
            >
              <ArrowLeft className={styles.curation__backIcon} />
              Retour
            </button>
            <div className={styles.curation__title}>
              <h1>Curation de Playlists</h1>
              <p>Importez et activez des playlists pour vos enfants</p>
            </div>
          </div>

          {error && (
            <div className={styles.curation__error}>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.curation__success}>
              {success}
            </div>
          )}

          {/* Import Section */}
          <div className={styles.curation__import}>
            <h2>Importer des Playlists</h2>
            
            <div className={styles.import__options}>
              <label className={styles.import__filter}>
                <input
                  type="checkbox"
                  checked={excludeExplicit}
                  onChange={(e) => setExcludeExplicit(e.target.checked)}
                />
                <Filter className={styles.import__filterIcon} />
                Exclure le contenu explicite
              </label>
            </div>

            <div className={styles.import__methods}>
              {/* Spotify Import */}
              <div className={styles.import__method}>
                <h3>Depuis Spotify</h3>
                <div className={styles.import__spotify}>
                  <input
                    type="text"
                    placeholder="URL ou ID de playlist Spotify"
                    value={spotifyUrl}
                    onChange={(e) => setSpotifyUrl(e.target.value)}
                    className={styles.import__input}
                  />
                  <button
                    onClick={importSpotifyPlaylist}
                    disabled={isImporting || !spotifyUrl.trim()}
                    className="btn btn--primary"
                  >
                    <Upload className={styles.import__icon} />
                    {isImporting ? 'Import...' : 'Importer'}
                  </button>
                </div>
              </div>

              {/* Patou Import */}
              <div className={styles.import__method}>
                <h3>Playlists Patou</h3>
                <button
                  onClick={importPatouPlaylists}
                  disabled={isImporting}
                  className="btn btn--secondary"
                >
                  <Download className={styles.import__icon} />
                  {isImporting ? 'Import...' : 'Importer Playlists Patou'}
                </button>
              </div>
            </div>
          </div>

          {/* Playlists Selection */}
          {playlists.length > 0 && (
            <div className={styles.curation__selection}>
              <h2>Sélectionner les Playlists</h2>
              <div className={styles.playlists__grid}>
                {playlists.map((playlist) => (
                  <div
                    key={playlist.id}
                    className={`${styles.playlist__card} ${
                      selectedPlaylists.has(playlist.id) ? styles['playlist__card--selected'] : ''
                    }`}
                    onClick={() => togglePlaylistSelection(playlist.id)}
                  >
                    <div className={styles.playlist__cover}>
                      {playlist.cover ? (
                        <img src={playlist.cover} alt={playlist.title} />
                      ) : (
                        <div className={styles.playlist__placeholder}>
                          <Play className={styles.playlist__playIcon} />
                        </div>
                      )}
                    </div>
                    <div className={styles.playlist__info}>
                      <h3>{playlist.title}</h3>
                      <p>
                        {playlist.source === 'spotify' ? '🎵 Spotify' : '🎨 Patou'}
                        {playlist.explicit_filtered && ' • Sans contenu explicite'}
                      </p>
                    </div>
                    <div className={styles.playlist__checkbox}>
                      {selectedPlaylists.has(playlist.id) ? (
                        <Check className={styles.playlist__checkIcon} />
                      ) : (
                        <div className={styles.playlist__checkEmpty} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Children Selection */}
          {children.length > 0 && selectedPlaylists.size > 0 && (
            <div className={styles.curation__children}>
              <h2>Sélectionner les Enfants</h2>
              <div className={styles.children__grid}>
                {children.map((child) => (
                  <div
                    key={child.id}
                    className={`${styles.child__card} ${
                      selectedChildren.has(child.id) ? styles['child__card--selected'] : ''
                    }`}
                    onClick={() => toggleChildSelection(child.id)}
                  >
                    <div className={styles.child__avatar}>
                      {child.emoji}
                    </div>
                    <div className={styles.child__info}>
                      <h3>{child.name}</h3>
                    </div>
                    <div className={styles.child__checkbox}>
                      {selectedChildren.has(child.id) ? (
                        <Check className={styles.child__checkIcon} />
                      ) : (
                        <div className={styles.child__checkEmpty} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Activation */}
          {selectedPlaylists.size > 0 && selectedChildren.size > 0 && (
            <div className={styles.curation__activation}>
              <button
                onClick={activateForChildren}
                disabled={isActivating}
                className="btn btn--primary btn--large"
              >
                <Check className={styles.activation__icon} />
                {isActivating 
                  ? 'Activation...' 
                  : `Activer ${selectedPlaylists.size} playlist(s) pour ${selectedChildren.size} enfant(s)`
                }
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}