import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlayerSdk from '../components/PlayerSdk'
import { getSpotifyTokens } from '../utils/spotify-tokens'

export default function Player() {
  const [searchParams] = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const trackId = searchParams.get('trackId')

  useEffect(() => {
    const tokens = getSpotifyTokens()
    if (tokens) {
      setAccessToken(tokens.access_token)
    }
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (!accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Spotify non connecté
          </h2>
          <p className="text-gray-600">
            Veuillez vous connecter à Spotify pour utiliser le lecteur.
          </p>
        </div>
      </div>
    )
  }

  if (!trackId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">
            No track selected
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto">
        <PlayerSdk 
          accessToken={accessToken}
          trackId={trackId}
        />
      </div>
    </div>
  )
}