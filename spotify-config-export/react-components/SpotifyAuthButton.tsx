import React from 'react'
import { useSpotifyAuth } from '../react-hooks/useSpotifyAuth'

interface SpotifyAuthButtonProps {
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  children?: React.ReactNode
}

export default function SpotifyAuthButton({ 
  onSuccess, 
  onError, 
  className = '',
  children 
}: SpotifyAuthButtonProps) {
  const { isAuthenticated, isLoading, error, user, startAuth, logout } = useSpotifyAuth()

  const handleAuth = async () => {
    try {
      await startAuth()
      onSuccess?.()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Auth failed'
      onError?.(errorMessage)
    }
  }

  if (isLoading) {
    return (
      <button disabled className={`opacity-50 cursor-not-allowed ${className}`}>
        <div className="flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full"></div>
          Vérification...
        </div>
      </button>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span className="text-sm font-medium">Spotify connecté</span>
        </div>
        <button
          onClick={logout}
          className="px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors text-sm"
        >
          Déconnecter
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={handleAuth}
      className={`flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors ${className}`}
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
      </svg>
      {children || 'Connecter Spotify'}
    </button>
  )

  if (error) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg">
        <span>❌</span>
        <span className="text-sm">{error}</span>
        <button
          onClick={handleAuth}
          className="ml-2 px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
        >
          Réessayer
        </button>
      </div>
    )
  }
}