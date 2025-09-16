export interface SpotifyTokens {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

export interface SpotifyPlayer {
  connect(): Promise<boolean>
  disconnect(): void
  addListener(event: string, callback: (data: any) => void): void
  removeListener(event: string, callback?: (data: any) => void): void
  getCurrentState(): Promise<any>
  setName(name: string): Promise<void>
  getVolume(): Promise<number>
  setVolume(volume: number): Promise<void>
  pause(): Promise<void>
  resume(): Promise<void>
  togglePlay(): Promise<void>
  seek(position: number): Promise<void>
  previousTrack(): Promise<void>
  nextTrack(): Promise<void>
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (options: {
        name: string
        getOAuthToken: (cb: (token: string) => void) => void
        volume?: number
      }) => SpotifyPlayer
    }
  }
}