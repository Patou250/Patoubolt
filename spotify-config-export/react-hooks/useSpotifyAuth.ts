import { useState, useEffect } from 'react'
import { getSpotifyTokens, clearSpotifyTokens } from '../spotify-tokens'

interface SpotifyAuthState {
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  user: any | null
}

export function useSpotifyAuth() {
  const [state, setState] = useState<SpotifyAuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking Spotify auth status...')
      
      const tokens = getSpotifyTokens()
      if (!tokens) {
        console.log('❌ No tokens found')
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          user: null
        })
        return
      }

      // Verify token by getting user profile
      const response = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      if (!response.ok) {
        console.log('❌ Token invalid, clearing...')
        clearSpotifyTokens()
        setState({
          isAuthenticated: false,
          isLoading: false,
          error: 'Token expired',
          user: null
        })
        return
      }

      const user = await response.json()
      console.log('✅ Spotify authenticated:', user.display_name)

      setState({
        isAuthenticated: true,
        isLoading: false,
        error: null,
        user
      })

    } catch (error) {
      console.error('❌ Auth check error:', error)
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        user: null
      })
    }
  }

  const startAuth = async (): Promise<void> => {
    try {
      console.log('🔗 Starting Spotify auth...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const authUrl = `${supabaseUrl}/functions/v1/spotify-auth?action=login`
      
      const response = await fetch(authUrl, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Auth request failed: ${response.status}`)
      }

      const data = await response.json()
      
      if (data.authorize_url) {
        localStorage.setItem('spotify_auth_state', data.state)
        window.location.href = data.authorize_url
      } else {
        throw new Error('Invalid auth response')
      }

    } catch (error) {
      console.error('❌ Start auth error:', error)
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Auth failed'
      }))
    }
  }

  const logout = (): void => {
    console.log('👋 Spotify logout')
    clearSpotifyTokens()
    setState({
      isAuthenticated: false,
      isLoading: false,
      error: null,
      user: null
    })
  }

  return {
    ...state,
    startAuth,
    logout,
    refresh: checkAuthStatus
  }
}