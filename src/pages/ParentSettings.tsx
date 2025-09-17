import { useEffect, useState } from 'react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

export default function ParentSettings() {
  const [spotifyOk,setSpotifyOk]=useState<boolean>(false)
  
  useEffect(() => {
    const tokens = getSpotifyTokens()
    setSpotifyOk(!!tokens)
  }, [])

  const connectSpotify = () => {
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/parent/callback`
    
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    const state = Math.random().toString(36).substring(7)
    localStorage.setItem('spotify_auth_state', state)

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true&` +
      `state=${state}`

    window.location.href = authUrl
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Réglages</h1>
      <div className="p-4 border rounded">
        <div className="font-medium mb-1">Spotify</div>
        <div>{spotifyOk ? '✅ Connecté' : '❌ Non connecté'}</div>
        {!spotifyOk && (
          <button onClick={connectSpotify}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded">
            Connecter Spotify
          </button>
        )}
      </div>
    </div>
  )
}