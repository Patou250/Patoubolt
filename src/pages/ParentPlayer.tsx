import PlayerSdk from '../components/PlayerSdk'

export default function ParentPlayer() {
  const token = localStorage.getItem('spotify_access_token')
  if (!token) return <p>Connectez votre compte Spotify.</p>
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Player Parent</h1>
      <PlayerSdk accessToken={token} />
    </div>
  )
}