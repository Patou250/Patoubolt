import { useState, useEffect, useCallback, useRef } from 'react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume: number
      }) => SpotifyPlayer
    }
  }
}

interface SpotifyPlayer {
  addListener: (event: string, callback: (data?: any) => void) => boolean
  removeListener: (event: string, callback?: (data?: any) => void) => boolean
  connect: () => Promise<boolean>
  disconnect: () => void
  getCurrentState: () => Promise<SpotifyPlaybackState | null>
  setName: (name: string) => Promise<void>
  getVolume: () => Promise<number>
  setVolume: (volume: number) => Promise<void>
  pause: () => Promise<void>
  resume: () => Promise<void>
  togglePlay: () => Promise<void>
  seek: (position_ms: number) => Promise<void>
  previousTrack: () => Promise<void>
  nextTrack: () => Promise<void>
}

interface SpotifyPlaybackState {
  paused: boolean
  position: number
  duration: number
  track_window: {
    current_track: {
      id: string
      name: string
      artists: Array<{ name: string }>
      album: {
        name: string
        images: Array<{ url: string }>
      }
      duration_ms: number
    }
  }
}

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
}

export function useSpotifyWebPlayback() {
  const [player, setPlayer] = useState<SpotifyPlayer | null>(null)
  const [deviceId, setDeviceId] = useState<string>('')
  const [isReady, setIsReady] = useState(false)
  const [isActive, setIsActive] = useState(false)
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [error, setError] = useState<string | null>(null)
  
  const accessTokenRef = useRef<string>('')

  // Load Spotify SDK
  useEffect(() => {
    if (document.getElementById('spotify-sdk')) return

    const script = document.createElement('script')
    script.id = 'spotify-sdk'
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
  }, [])

  // Initialize player
  useEffect(() => {
    console.log('🎵 Initializing Spotify Web Playback SDK...')
    const tokens = getSpotifyTokens()
    if (!tokens) {
      console.error('❌ No Spotify tokens available for playback')
      setError('Connexion Spotify requise')
      return
    }

    console.log('✅ Spotify tokens found, setting up player...')
    accessTokenRef.current = tokens.access_token

    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('🎵 Spotify SDK ready, creating player...')
      const spotifyPlayer = new window.Spotify.Player({
        name: 'Patou Player',
        getOAuthToken: (cb) => cb(accessTokenRef.current),
        volume: volume
      })

      setPlayer(spotifyPlayer)

      // Player event listeners
      spotifyPlayer.addListener('ready', async ({ device_id }: { device_id: string }) => {
        console.log('✅ Spotify Player ready with Device ID:', device_id)
        setDeviceId(device_id)
        setIsReady(true)
        setError(null)
        
        // Transfer playback to this device
        try {
          console.log('🔄 Transferring playback to device...')
          await fetch('https://api.spotify.com/v1/me/player', {
            method: 'PUT',
            headers: { 
              Authorization: `Bearer ${accessTokenRef.current}`, 
              'Content-Type': 'application/json' 
            },
            body: JSON.stringify({ 
              device_ids: [device_id], 
              play: false 
            })
          })
          console.log('✅ Device activated')
        } catch (error) {
          console.error('❌ Device activation failed:', error)
        }
      })

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('❌ Device has gone offline:', device_id)
        setIsReady(false)
      })

      spotifyPlayer.addListener('player_state_changed', (state: SpotifyPlaybackState | null) => {
        if (!state) return

        setIsPlaying(!state.paused)
        setPosition(state.position)
        setDuration(state.duration)

        const track = state.track_window?.current_track
        if (track) {
          const newTrack: Track = {
            id: track.id,
            name: track.name,
            artists: track.artists,
            album: track.album,
            duration_ms: track.duration_ms
          }
          
          if (newTrack.id !== currentTrack?.id) {
            setCurrentTrack(newTrack)
            
            // Save to play history
            const historyItem = {
              trackId: newTrack.id,
              name: newTrack.name,
              artist: newTrack.artists.map(a => a.name).join(', '),
              cover: newTrack.album.images?.[0]?.url || '',
              ts: Date.now()
            }
            
            try {
              const historyRaw = localStorage.getItem('patou_play_history')
              const history = historyRaw ? JSON.parse(historyRaw) : []
              history.unshift(historyItem)
              if (history.length > 100) history.pop()
              localStorage.setItem('patou_play_history', JSON.stringify(history))
            } catch (error) {
              console.error('❌ Error saving to history:', error)
            }
          }
        }
      })

      // Error listeners
      spotifyPlayer.addListener('initialization_error', ({ message }: { message: string }) => {
        console.error('❌ Initialization error:', message)
        setError(`Erreur d'initialisation: ${message}`)
      })

      spotifyPlayer.addListener('authentication_error', ({ message }: { message: string }) => {
        console.error('❌ Authentication error:', message)
        setError(`Erreur d'authentification: ${message}`)
      })

      spotifyPlayer.addListener('account_error', ({ message }: { message: string }) => {
        console.error('❌ Account error:', message)
        setError(`Erreur de compte: ${message}`)
      })

      spotifyPlayer.addListener('playback_error', ({ message }: { message: string }) => {
        console.error('❌ Playback error:', message)
        setError(`Erreur de lecture: ${message}`)
      })

      // Connect player
      spotifyPlayer.connect()
    }

    return () => {
      if (player) {
        try {
          player.disconnect()
        } catch (error) {
          console.error('❌ Error disconnecting player:', error)
        }
      }
    }
  }, [volume])

  // Player control methods
  const playTrack = useCallback(async (spotifyUri: string) => {
    if (!deviceId || !accessTokenRef.current) {
      console.error('❌ Player not ready - deviceId:', !!deviceId, 'token:', !!accessTokenRef.current)
      setError('Lecteur non prêt')
      return
    }

    try {
      console.log('🎵 Playing track:', spotifyUri)
      const response = await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessTokenRef.current}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uris: [spotifyUri]
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Spotify Play API error:', response.status, errorText)
        throw new Error(`Erreur lecture: ${response.status}`)
      }

      setError(null)
      console.log('✅ Track started:', spotifyUri)
    } catch (error) {
      console.error('❌ Error playing track:', error)
      setError(error instanceof Error ? error.message : 'Erreur de lecture')
    }
  }, [deviceId])

  const togglePlayback = useCallback(async () => {
    if (!player) return
    
    try {
      await player.togglePlay()
      setError(null)
    } catch (error) {
      console.error('❌ Error toggling playback:', error)
      setError('Erreur play/pause')
    }
  }, [player])

  const seekTo = useCallback(async (position_ms: number) => {
    if (!player) return
    
    try {
      await player.seek(position_ms)
      setPosition(position_ms)
      setError(null)
    } catch (error) {
      console.error('❌ Error seeking:', error)
      setError('Erreur de positionnement')
    }
  }, [player])

  const setPlayerVolume = useCallback(async (newVolume: number) => {
    if (!player) return
    
    try {
      await player.setVolume(newVolume)
      setVolume(newVolume)
      setError(null)
    } catch (error) {
      console.error('❌ Error setting volume:', error)
      setError('Erreur de volume')
    }
  }, [player])

  const nextTrack = useCallback(async () => {
    if (!player) return
    
    try {
      await player.nextTrack()
      setError(null)
    } catch (error) {
      console.error('❌ Error next track:', error)
      setError('Erreur piste suivante')
    }
  }, [player])

  const previousTrack = useCallback(async () => {
    if (!player) return
    
    try {
      await player.previousTrack()
      setError(null)
    } catch (error) {
      console.error('❌ Error previous track:', error)
      setError('Erreur piste précédente')
    }
  }, [player])

  return {
    player,
    deviceId,
    isReady,
    isActive,
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    error,
    playTrack,
    togglePlayback,
    seekTo,
    setVolume: setPlayerVolume,
    nextTrack,
    previousTrack
  }
}