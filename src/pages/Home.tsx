import { Link } from 'react-router-dom'

export default function Home() {
  const handleParentLogin = () => {
    // Redirection directe vers l'authentification Spotify
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
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-6">Patou</h1>
      <div className="flex gap-4">
        <button 
          onClick={handleParentLogin}
          className="px-6 py-3 bg-black text-white rounded hover:bg-gray-800 transition-colors"
        >
          Espace parent
        </button>
        <Link to="/child/login" className="px-6 py-3 bg-green-600 text-white rounded">Espace enfant</Link>
      </div>
    </div>
  )
}