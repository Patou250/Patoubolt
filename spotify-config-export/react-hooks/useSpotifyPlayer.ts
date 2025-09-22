import { useState, useEffect, useCallback } from 'react'
import { spotifyPlayer } from '../spotify-player'
import { spotifyWebPlayback } from '../spotify-web-playback'

interface PlayerState {
  isPlaying: boolean
  currentTrack: any | null
  position: number
  duration: number
  volume: number
  deviceId: string
  isReady: boolean
  error: string | null
}

export function useSpotifyPlayer() {
  const [state, setState] = useState<PlayerState>({
    isPlaying: false,
    currentTrack: null,
    position: 0,
    duration: 0,
    volume: 50,
    deviceId: '',
    isReady: false,
    error: null
  })

  useEffect(() => {
    initializePlayer()
    return () => {
      spotifyWebPlayback.disconnect()
    }
  }, [])

  const initializePlayer = async () => {
    try {
      console.log('🎵 Initializing Spotify player...')
      
      await spotifyWebPlayback.initialize()

      // Setup event listeners
      spotifyWebPlayback.on('ready', ({ device_id }: { device_id: string }) => {
        setState(prev => ({
          ...prev,
          deviceId: device_id,
          isReady: true,
          error: null
        }))
      })

      spotifyWebPlayback.on('not_ready', () => {
        setState(prev => ({
          ...prev,
          isReady: false
        }))
      })

      spotifyWebPlayback.on('player_state_changed', (playbackState: any) => {
        if (!playbackState) return

        setState(prev => ({
          ...prev,
          isPlaying: !playbackState.paused,
          position: playbackState.position,
          duration: playbackState.duration,
          currentTrack: playbackState.track_window?.current_track || null
        }))
      })

      spotifyWebPlayback.on('error', ({ message }: { message: string }) => {
        setState(prev => ({
          ...prev,
          error: message
        }))
      })

    } catch (error) {
      console.error('❌ Player initialization error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Player initialization failed'
      }))
    }
  }

  const playTrack = useCallback(async (trackId: string) => {
    try {
      console.log('▶️ Playing track:', trackId)
      setState(prev => ({ ...prev, error: null }))
      
      if (state.deviceId) {
        await spotifyPlayer.playTrack(trackId, state.deviceId)
      } else {
        await spotifyPlayer.playTrack(trackId)
      }
    } catch (error) {
      console.error('❌ Play error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Play failed'
      }))
    }
  }, [state.deviceId])

  const togglePlayback = useCallback(async () => {
    try {
      await spotifyWebPlayback.togglePlay()
      setState(prev => ({ ...prev, error: null }))
    } catch (error) {
      console.error('❌ Toggle error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Toggle failed'
      }))
    }
  }, [])

  const nextTrack = useCallback(async () => {
    try {
      await spotifyWebPlayback.nextTrack()
      setState(prev => ({ ...prev, error: null }))
    } catch (error) {
      console.error('❌ Next error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Next failed'
      }))
    }
  }, [])

  const previousTrack = useCallback(async () => {
    try {
      await spotifyWebPlayback.previousTrack()
      setState(prev => ({ ...prev, error: null }))
    } catch (error) {
      console.error('❌ Previous error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Previous failed'
      }))
    }
  }, [])

  const setVolume = useCallback(async (volume: number) => {
    try {
      await spotifyWebPlayback.setVolume(volume / 100)
      setState(prev => ({ ...prev, volume, error: null }))
    } catch (error) {
      console.error('❌ Volume error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Volume failed'
      }))
    }
  }, [])

  const seekTo = useCallback(async (position: number) => {
    try {
      await spotifyWebPlayback.seek(position)
      setState(prev => ({ ...prev, error: null }))
    } catch (error) {
      console.error('❌ Seek error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Seek failed'
      }))
    }
  }, [])

  return {
    ...state,
    playTrack,
    togglePlayback,
    nextTrack,
    previousTrack,
    setVolume,
    seekTo
  }
}