import { useEffect, useState } from 'react'

export function useSpotifyToken() {
  const [token, setToken] = useState<string | null>(null)

  const refresh = async () => {
    const res = await fetch('/.netlify/functions/spotify-refresh', { credentials: 'include' })
    if (!res.ok) throw new Error('refresh failed')
    const { access_token } = await res.json()
    setToken(access_token)
  }

  useEffect(() => { refresh().catch(console.error) }, [])
  return { accessToken: token, refresh }
}