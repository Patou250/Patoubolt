import React, { useEffect, useState, useRef } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, Shuffle, Repeat } from 'lucide-react'

console.log('🚀 PLAYER-SDK - Module PlayerSdk.tsx chargé')

interface Track {
  id: string
  name: string
  artists: { name: string }[]
  album: {
    name: string
    images: { url: string }[]
  }
  duration_ms: number
}

interface PlayerState {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: any
  }
}

interface PlayerSdkProps {
  accessToken: string
  onTrackChange?: (trackId: string) => void
  trackId?: string
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

export default function PlayerSdk({ accessToken, onTrackChange, trackId }: PlayerSdkProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isReady, setIsReady] = useState(false)
  const [deviceId, setDeviceId] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const playerRef = useRef<any>(null)

  console.log('🚀 PLAYER-SDK - Rendu du lecteur SDK')

  useEffect(() => {
    console.log('🚀 PLAYER-SDK - Initialisation du SDK Spotify')
    
    // Charger le SDK Spotify Web Playback (avec protection contre les doublons)
    if (!window.Spotify && !document.getElementById('spotify-sdk')) {
      const script = document.createElement('script')
      script.id = 'spotify-sdk'
      script.src = 'https://sdk.scdn.co/spotify-player.js'
      script.async = true
      document.body.appendChild(script)
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('🚀 PLAYER-SDK - SDK Spotify prêt')
      
      const player = new window.Spotify.Player({
        name: 'Patou Player',
        getOAuthToken: (cb: (token: string) => void) => {
          cb(accessToken)
        },
        volume: volume / 100
      })

      playerRef.current = player

      // Événements du lecteur
      player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('🚀 PLAYER-SDK - Device prêt:', device_id)
        setDeviceId(device_id)
        setIsReady(true)
      })

      player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('🚀 PLAYER-SDK - Device non prêt:', device_id)
        setIsReady(false)
      })

      player.addListener('player_state_changed', (state: PlayerState | null) => {
        if (!state) return

        console.log('🚀 PLAYER-SDK - État changé:', state)
        
        setIsPlaying(!state.paused)
        setPosition(state.position)
        setDuration(state.duration)
        
        if (state.track_window?.current_track) {
          const track = state.track_window.current_track
          const newTrack = {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            duration_ms: track.duration_ms
          }
          setCurrentTrack(newTrack)
          
          // Notify parent component of track change
          if (onTrackChange && track.id !== currentTrack?.id) {
            onTrackChange(track.id)
          }
        }
      })

      player.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('🚨 PLAYER-SDK - Erreur initialisation:', message)
        setError(`Erreur d'initialisation: ${message}`)
      })

      player.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('🚨 PLAYER-SDK - Erreur authentification:', message)
        setError(`Erreur d'authentification: ${message}`)
      })

      player.addListener('account_error', ({ message }: { message: string }) => {
        console.error('🚨 PLAYER-SDK - Erreur compte:', message)
        setError(`Erreur de compte: ${message}. Un compte Spotify Premium est requis.`)
      })

      player.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('🚨 PLAYER-SDK - Erreur lecture:', message)
        setError(`Erreur de lecture: ${message}`)
      })

      // Connecter le lecteur
      player.connect().then((success: boolean) => {
        if (success) {
          console.log('🚀 PLAYER-SDK - Lecteur connecté avec succès')
        } else {
          console.error('🚨 PLAYER-SDK - Échec de connexion du lecteur')
          setError('Impossible de connecter le lecteur')
        }
      })
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect()
      }
    }
  }, [accessToken, volume])

  // Auto-play track if trackId is provided
  useEffect(() => {
    if (trackId && deviceId && accessToken) {
      const playSpecificTrack = async () => {
        try {
          await startPlayback([`spotify:track:${trackId}`])
        } catch (error) {
          console.error('Failed to auto-play track:', error)
        }
      }
      
      // Wait a bit for the device to be ready
      setTimeout(playSpecificTrack, 2000)
    }
  }, [trackId, deviceId, accessToken])

  const handlePlayPause = async () => {
    if (!playerRef.current) return
    
    console.log('🚀 PLAYER-SDK - Toggle play/pause')
    try {
      await playerRef.current.togglePlay()
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur play/pause:', error)
    }
  }

  const handlePrevious = async () => {
    if (!playerRef.current) return
    
    console.log('🚀 PLAYER-SDK - Piste précédente')
    try {
      await playerRef.current.previousTrack()
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur piste précédente:', error)
    }
  }

  const handleNext = async () => {
    if (!playerRef.current) return
    
    console.log('🚀 PLAYER-SDK - Piste suivante')
    try {
      await playerRef.current.nextTrack()
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur piste suivante:', error)
    }
  }

  const handleVolumeChange = async (newVolume: number) => {
    if (!playerRef.current) return
    
    console.log('🚀 PLAYER-SDK - Changement de volume:', newVolume)
    setVolume(newVolume)
    try {
      await playerRef.current.setVolume(newVolume / 100)
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur volume:', error)
    }
  }

  const handleSeek = async (positionMs: number) => {
    if (!playerRef.current) return
    
    console.log('🚀 PLAYER-SDK - Seek vers:', positionMs)
    try {
      await playerRef.current.seek(positionMs)
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur seek:', error)
    }
  }

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const startPlayback = async (uris?: string[]) => {
    if (!deviceId) return
    
    try {
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: uris || ['spotify:track:4VqPOruhp5EdPBeR92t6lQ'] // Exemple: Uptown Funk
        })
      })
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`)
      }
      
      console.log('🚀 PLAYER-SDK - Lecture démarrée')
    } catch (error) {
      console.error('🚨 PLAYER-SDK - Erreur démarrage lecture:', error)
      setError('Impossible de démarrer la lecture')
    }
  }

  if (!isReady && !error) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Connexion au lecteur Spotify...</h3>
        <p className="text-gray-600">Initialisation du SDK Web Playback</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">Erreur du lecteur</h3>
          <p className="text-red-700 mb-4">{error}</p>
          {!currentTrack && (
            <button
              onClick={() => startPlayback()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Démarrer la lecture
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black text-white rounded-lg p-6">
      {/* Informations de la piste */}
      {currentTrack ? (
        <div className="flex items-center space-x-4 mb-6">
          <img
            src={currentTrack.album.images[0]?.url}
            alt={currentTrack.album.name}
            className="w-16 h-16 rounded-lg shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{currentTrack.name}</h3>
            <p className="text-gray-300">{currentTrack.artists.map(a => a.name).join(', ')}</p>
            <p className="text-gray-400 text-sm">{currentTrack.album.name}</p>
          </div>
          <button className="text-gray-400 hover:text-white transition-colors">
            <Heart className="w-6 h-6" />
          </button>
        </div>
      ) : (
        <div className="text-center mb-6">
          <p className="text-gray-400 mb-4">Aucune piste en cours</p>
          <button
            onClick={() => startPlayback()}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Démarrer la lecture
          </button>
        </div>
      )}

      {/* Barre de progression */}
      {currentTrack && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
            <span>{formatTime(position)}</span>
            <div 
              className="flex-1 bg-gray-700 rounded-full h-1 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const x = e.clientX - rect.left
                const percentage = x / rect.width
                const newPosition = percentage * duration
                handleSeek(newPosition)
              }}
            >
              <div
                className="bg-green-500 h-1 rounded-full transition-all duration-300"
                style={{ width: `${duration > 0 ? (position / duration) * 100 : 0}%` }}
              />
            </div>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Contrôles de lecture */}
      <div className="flex items-center justify-center space-x-6 mb-6">
        <button className="text-gray-400 hover:text-white transition-colors">
          <Shuffle className="w-5 h-5" />
        </button>
        
        <button
          onClick={handlePrevious}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={!isReady}
        >
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button
          onClick={handlePlayPause}
          disabled={!isReady}
          className="bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-full p-3 transition-colors"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        
        <button
          onClick={handleNext}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={!isReady}
        >
          <SkipForward className="w-6 h-6" />
        </button>
        
        <button className="text-gray-400 hover:text-white transition-colors">
          <Repeat className="w-5 h-5" />
        </button>
      </div>

      {/* Contrôle du volume */}
      <div className="flex items-center space-x-3">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <div className="flex-1 max-w-32">
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => handleVolumeChange(parseInt(e.target.value))}
            className="w-full h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        <span className="text-sm text-gray-400 w-8">{volume}%</span>
      </div>

      {/* Informations du device */}
      {deviceId && (
        <div className="mt-6 bg-green-900/30 border border-green-700/50 rounded-lg p-4">
          <p className="text-green-200 text-sm">
            <strong>Lecteur connecté :</strong> Device ID: {deviceId.slice(0, 8)}...
          </p>
          <p className="text-green-300 text-xs mt-1">
            Utilisez l'application Spotify pour transférer la lecture vers ce lecteur.
          </p>
        </div>
      )}
    </div>
  )
}