import { getSpotifyTokens } from './spotify-tokens'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume: number
      }) => SpotifyWebPlayer
    }
  }
}

interface SpotifyWebPlayer {
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

export class SpotifyWebPlaybackService {
  private player: SpotifyWebPlayer | null = null
  private deviceId: string = ''
  private isReady: boolean = false
  private callbacks: Record<string, Function[]> = {}

  constructor() {
    this.loadSDK()
  }

  private loadSDK(): void {
    if (document.getElementById('spotify-sdk')) return

    console.log('📦 Loading Spotify Web Playback SDK...')
    const script = document.createElement('script')
    script.id = 'spotify-sdk'
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true
    document.body.appendChild(script)
  }

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log('🎵 Initializing Spotify Web Playback...')
      
      const tokens = getSpotifyTokens()
      if (!tokens) {
        reject(new Error('No Spotify tokens available'))
        return
      }

      window.onSpotifyWebPlaybackSDKReady = () => {
        console.log('✅ Spotify SDK ready, creating player...')
        
        this.player = new window.Spotify.Player({
          name: 'Patou Player',
          getOAuthToken: (cb) => {
            const currentTokens = getSpotifyTokens()
            if (currentTokens) {
              cb(currentTokens.access_token)
            }
          },
          volume: 0.5
        })

        // Setup event listeners
        this.setupEventListeners()

        // Connect player
        this.player.connect().then(success => {
          if (success) {
            console.log('✅ Player connected successfully')
            resolve()
          } else {
            reject(new Error('Failed to connect player'))
          }
        })
      }
    })
  }

  private setupEventListeners(): void {
    if (!this.player) return

    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('✅ Player ready with device ID:', device_id)
      this.deviceId = device_id
      this.isReady = true
      this.emit('ready', { device_id })
    })

    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('❌ Player not ready:', device_id)
      this.isReady = false
      this.emit('not_ready', { device_id })
    })

    this.player.addListener('player_state_changed', (state: SpotifyPlaybackState | null) => {
      console.log('🎵 Player state changed:', state?.is_playing ? 'playing' : 'paused')
      this.emit('player_state_changed', state)
    })

    this.player.addListener('initialization_error', ({ message }: { message: string }) => {
      console.error('❌ Initialization error:', message)
      this.emit('error', { type: 'initialization', message })
    })

    this.player.addListener('authentication_error', ({ message }: { message: string }) => {
      console.error('❌ Authentication error:', message)
      this.emit('error', { type: 'authentication', message })
    })

    this.player.addListener('account_error', ({ message }: { message: string }) => {
      console.error('❌ Account error:', message)
      this.emit('error', { type: 'account', message })
    })

    this.player.addListener('playback_error', ({ message }: { message: string }) => {
      console.error('❌ Playback error:', message)
      this.emit('error', { type: 'playback', message })
    })
  }

  // Event system
  on(event: string, callback: Function): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(callback)
  }

  off(event: string, callback?: Function): void {
    if (!this.callbacks[event]) return
    
    if (callback) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback)
    } else {
      this.callbacks[event] = []
    }
  }

  private emit(event: string, data?: any): void {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(data))
    }
  }

  // Player controls
  async play(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.resume()
  }

  async pause(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.pause()
  }

  async togglePlay(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.togglePlay()
  }

  async nextTrack(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.nextTrack()
  }

  async previousTrack(): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.previousTrack()
  }

  async seek(position_ms: number): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.seek(position_ms)
  }

  async setVolume(volume: number): Promise<void> {
    if (!this.player) throw new Error('Player not initialized')
    await this.player.setVolume(volume)
  }

  async getCurrentState(): Promise<SpotifyPlaybackState | null> {
    if (!this.player) throw new Error('Player not initialized')
    return await this.player.getCurrentState()
  }

  getDeviceId(): string {
    return this.deviceId
  }

  isPlayerReady(): boolean {
    return this.isReady
  }

  disconnect(): void {
    if (this.player) {
      this.player.disconnect()
      this.player = null
      this.isReady = false
      this.deviceId = ''
    }
  }
}

// Export singleton instance
export const spotifyWebPlayback = new SpotifyWebPlaybackService()