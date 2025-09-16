import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlayerSdk from '../components/PlayerSdk'
import { getSpotifyTokens } from '../utils/spotify-tokens'

export default function Player() {
  const [searchParams] = useSearchParams()
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const trackId = searchParams.get('trackId')

  useEffect(() => {
    loadAccessToken()
  }, [])

  const loadAccessToken = async () => {
    try {
      // Try to get tokens from existing storage
      const tokens = getSpotifyTokens()
      
      if (tokens && tokens.access_token) {
        setAccessToken(tokens.access_token)
        setLoading(false)
        return
      }

      // If no tokens, try to refresh
      console.log('🔄 Refreshing Spotify token...')
      const response = await fetch('/.netlify/functions/spotify-refresh', {
        method: 'POST',
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.access_token) {
        setAccessToken(data.access_token)
        console.log('✅ Token refreshed successfully')
      } else {
        throw new Error('No access token in response')
      }
    } catch (error) {
      console.error('❌ Failed to get access token:', error)
      setError('Impossible de récupérer le token Spotify. Veuillez vous reconnecter.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeviceReady = async (deviceId: string) => {
    if (!accessToken) return

    try {
      console.log('🎵 Transferring playback to device:', deviceId)
      
      // Transfer playback to this device
      const response = await fetch('https://api.spotify.com/v1/me/player', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          device_ids: [deviceId],
          play: false // Don't start playing immediately
        })
      })

      if (response.ok) {
        console.log('✅ Playback transferred successfully')
      } else {
        console.warn('⚠️ Failed to transfer playback:', response.status)
      }
    } catch (error) {
      console.error('❌ Error transferring playback:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Chargement du lecteur...
          </h2>
          <p className="text-gray-600">
            Récupération du token Spotify
          </p>
        </div>
      </div>
    )
  }

  if (error || !accessToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Erreur de connexion
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'Token Spotify non disponible'}
          </p>
          <button
            onClick={() => window.location.href = '/parent/login'}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Se reconnecter
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Lecteur Spotify Patou
          </h1>
          <p className="text-gray-600">
            Contrôlez votre musique depuis l'interface parent
          </p>
        </div>

        <PlayerSdk 
          accessToken={accessToken}
          trackId={trackId || undefined}
          onDeviceReady={handleDeviceReady}
        />
      </div>
    </div>
  )
}