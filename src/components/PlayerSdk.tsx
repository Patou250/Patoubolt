import React, { useEffect, useState, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat, AlertTriangle } from 'lucide-react'

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: { name: string; images: { url: string }[] }
  duration_ms: number
}
interface PlayerState {
  paused: boolean
  position: number
  duration: number
  track_window: { current_track: any }
}
interface Props {
  accessToken: string
  onTrackChange?: (trackId: string) => void
  trackId?: string
  // optionnel: démarrer sur ces URIs (playlist/track)
  initialUris?: string[]
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => any
    }
  }
}

export default function PlayerSdk({ accessToken, onTrackChange, trackId, initialUris }: Props) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isReady, setIsReady] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<any>(null)

  // -------- Utils
  const formatTime = (ms: number) => {
    const m = Math.floor(ms / 60000)
    const s = Math.floor((ms % 60000) / 1000)
    return `${m}:${s.toString().padStart(2, '0')}`
  }
  const recoverable = (msg?: string | null) =>
    !!msg && /no list was loaded|no active device|context not set/i.test(msg)

  // -------- Load SDK once
  useEffect(() => {
    if (document.getElementById('spotify-sdk')) return
    const script = document.createElement('script')
    script.id = 'spotify-sdk'
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // -------- Init player
  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: 'Patou Player',
        getOAuthToken: cb => cb(accessToken),
        volume: volume / 100
      })

      playerRef.current = player

      player.addListener('ready', async ({ device_id }: { device_id: string }) => {
        setDeviceId(device_id)
        setIsReady(true)
        // Transfer playback to this device so /play will target it
        try {
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_ids: [device_id], play: false })
          })
        } catch {}
        // Transfer playback to this device so /play will target it
        try {
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ device_ids: [device_id], play: false })
          })
        } catch {}
        // Auto-start a context if none is loaded
        if (initialUris?.length) {
          startPlayback(initialUris)
        } else if (trackId) {
          startPlayback([`spotify:track:${trackId}`])
        }
      })

      player.addListener('not_ready', () => setIsReady(false))

      player.addListener('player_state_changed', (state: PlayerState | null) => {
        if (!state) return
        setIsPlaying(!state.paused)
        setPosition(state.position)
        setDuration(state.duration)

        const t = state.track_window?.current_track
        if (t) {
          const newTrack: Track = {
            id: t.id,
            name: t.name,
            artists: t.artists,
            album: t.album,
            duration_ms: t.duration_ms
          }
          if (newTrack.id !== currentTrack?.id) {
            onTrackChange?.(newTrack.id)
            
            // Track history tracking
            const payload = {
              trackId: newTrack.id,
              name: newTrack.name,
              artist: newTrack.artists.map(a=>a.name).join(', '),
              cover: newTrack.album.images?.[0]?.url || '',
              ts: Date.now()
            }
            localStorage.setItem('patou_last_track', JSON.stringify(payload))
            const rawHist = localStorage.getItem('patou_play_history')
            const hist = rawHist ? JSON.parse(rawHist) : []
            hist.unshift(payload); if (hist.length > 500) hist.pop()
            localStorage.setItem('patou_play_history', JSON.stringify(hist))
          }
          setCurrentTrack(newTrack)
          // clear recoverable error when a track finally loads
          if (recoverable(error)) setError(null)
        }
      })

      player.addListener('initialization_error', ({ message }: { message: string }) => setError(message))
      player.addListener('authentication_error', ({ message }: { message: string }) => setError(message))
      player.addListener('account_error', ({ message }: { message: string }) => setError(message))
      player.addListener('playback_error', ({ message }: { message: string }) => setError(message))

      player.connect()
    }

    return () => {
      if (playerRef.current) {
        try { playerRef.current.disconnect() } catch {}
      }
    }
  }, [accessToken]) // eslint-disable-line

  // -------- Controls
  const handlePlayPause = async () => {
    if (!playerRef.current) return
    try {
      await playerRef.current.togglePlay()
    } catch (e: any) {
      setError(e?.message || 'Erreur play/pause')
    }
  }
  const handlePrevious = async () => { try { await playerRef.current?.previousTrack() } catch (e:any){ setError(e?.message||'Erreur précédente') } }
  const handleNext = async () => { try { await playerRef.current?.nextTrack() } catch (e:any){ setError(e?.message||'Erreur suivante') } }
  const handleSeek = async (ms: number) => { try { await playerRef.current?.seek(ms) } catch (e:any){ setError(e?.message||'Erreur seek') } }
  const handleVolumeChange = async (v: number) => {
    setVolume(v)
    try { await playerRef.current?.setVolume(v / 100) } catch {}
  }

  const startPlayback = async (uris?: string[]) => {
    if (!deviceId) { setError('Aucun device prêt'); return }
    try {
      const res = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uris: uris && uris.length ? uris : ['spotify:track:4VqPOruhp5EdPBeR92t6lQ'] // titre de secours
        })
      })
      if (!res.ok) throw new Error(`API ${res.status}`)
      setError(null)
    } catch (e: any) {
      setError(e?.message || 'Impossible de démarrer la lecture')
    }
  }

  // -------- UI (toujours rendre le player, même en erreur)
  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-6">
      {/* Bandeau d'erreur non bloquant */}
      {error && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg p-3 ${recoverable(error) ? 'bg-yellow-600/30 border border-yellow-500/50' : 'bg-red-600/30 border border-red-500/50'}`}>
          <AlertTriangle className="w-4 h-4" />
          <div className="text-sm">
            <div className="font-medium">Erreur du lecteur</div>
            <div className="opacity-90">{error}</div>
            {recoverable(error) && (
              <button
                onClick={() => startPlayback()}
                className="mt-2 inline-block bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded"
              >
                Démarrer la lecture
              </button>
            )}
          </div>
        </div>
      )}

      {/* Infos piste ou état vide */}
      {currentTrack ? (
        <div className="flex items-center gap-4 mb-6">
          <img src={currentTrack.album.images[0]?.url} alt={currentTrack.album.name} className="w-16 h-16 rounded-lg shadow" />
          <div className="flex-1">
            <div className="text-lg font-semibold">{currentTrack.name}</div>
            <div className="text-gray-300 text-sm">{currentTrack.artists.map(a => a.name).join(', ')}</div>
            <div className="text-gray-400 text-xs">{currentTrack.album.name}</div>
          </div>
          <button className="text-gray-400 hover:text-white"><Heart className="w-5 h-5" /></button>
        </div>
      ) : (
        <div className="text-center mb-6">
          <p className="text-gray-300 mb-3">Aucune piste chargée</p>
          <button onClick={() => startPlayback()} className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded">
            Démarrer la lecture
          </button>
        </div>
      )}

      {/* Barre de progression */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>{formatTime(position)}</span>
          <div
            className="flex-1 bg-gray-700 rounded-full h-1 cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
              const pct = (e.clientX - rect.left) / rect.width
              handleSeek(pct * (duration || 0))
            }}
          >
            <div className="bg-green-500 h-1 rounded-full transition-all" style={{ width: `${duration ? (position / duration) * 100 : 0}%` }} />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Contrôles (toujours visibles) */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button className="text-gray-400 hover:text-white"><Shuffle className="w-5 h-5" /></button>
        <button onClick={handlePrevious} disabled={!isReady} className="text-gray-400 hover:text-white disabled:opacity-40">
          <SkipBack className="w-6 h-6" />
        </button>
        <button onClick={handlePlayPause} disabled={!isReady} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-full p-3">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        <button onClick={handleNext} disabled={!isReady} className="text-gray-400 hover:text-white disabled:opacity-40">
          <SkipForward className="w-6 h-6" />
        </button>
        <button className="text-gray-400 hover:text-white"><Repeat className="w-5 h-5" /></button>
      </div>

      {/* Volume */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <input
          type="range"
          min={0}
          max={100}
          value={volume}
          onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
          className="flex-1 max-w-40"
        />
        <span className="text-sm text-gray-400 w-8 text-right">{volume}%</span>
      </div>

      {/* Device info */}
      {deviceId && (
        <div className="mt-6 bg-green-900/30 border border-green-700/50 rounded-lg p-3 text-sm text-green-200">
          Device connecté : {deviceId.slice(0, 8)}… — ouvrez l'app Spotify et transférez la lecture vers "Patou Player".
        </div>
      )}
    </div>
  )
}