import React, { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import { Bug, Database, Music, Users, Play as Playlist, Shield, Clock } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSpotifyTokens } from '../utils/spotify-tokens'

interface DebugData {
  supabaseSession: {
    isAuthenticated: boolean
    userId: string | null
    email: string | null
    provider: string | null
    lastSignIn: string | null
  }
  spotifyStatus: {
    connected: boolean
    hasTokens: boolean
    canRefresh: boolean
    lastRefresh: string | null
  }
  spotifyDevice: {
    deviceId: string | null
    deviceName: string | null
    isReady: boolean
    lastReady: string | null
  }
  database: {
    childrenCount: number
    lastPlaylist: string | null
    totalPlaylists: number
    recentActivity: string | null
  }
  localStorage: {
    keys: string[]
    sizes: Record<string, number>
    totalSize: number
  }
  system: {
    userAgent: string
    timestamp: string
    host: string
    pathname: string
  }
}

export default function Debug() {
  const [searchParams] = useSearchParams()
  const [debugData, setDebugData] = useState<DebugData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Vérification du token d'accès
  const token = searchParams.get('token')
  if (!token) {
    return <Navigate to="/" replace />
  }

  useEffect(() => {
    loadDebugData()
  }, [])

  const loadDebugData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Session Supabase (anonymisée)
      const { data: { session } } = await supabase.auth.getSession()
      const supabaseSession = {
        isAuthenticated: !!session,
        userId: session?.user?.id ? `${session.user.id.slice(0, 8)}...` : null,
        email: session?.user?.email ? `${session.user.email.slice(0, 3)}***@${session.user.email.split('@')[1]}` : null,
        provider: session?.user?.app_metadata?.provider || null,
        lastSignIn: session?.user?.last_sign_in_at || null
      }

      // État Spotify
      const tokens = getSpotifyTokens()
      let canRefresh = false
      let lastRefresh = null

      if (tokens) {
        try {
          const refreshResponse = await fetch('/.netlify/functions/spotify-refresh', {
            method: 'POST',
            credentials: 'include'
          })
          canRefresh = refreshResponse.ok
          lastRefresh = new Date().toISOString()
        } catch (error) {
          console.warn('Refresh test failed:', error)
        }
      }

      const spotifyStatus = {
        connected: !!tokens && !!(tokens.access_token),
        hasTokens: !!tokens,
        canRefresh,
        lastRefresh
      }

      // Device Spotify SDK
      const deviceData = localStorage.getItem('spotify_device_info')
      const parsedDevice = deviceData ? JSON.parse(deviceData) : null
      const spotifyDevice = {
        deviceId: parsedDevice?.deviceId ? `${parsedDevice.deviceId.slice(0, 8)}...` : null,
        deviceName: parsedDevice?.deviceName || null,
        isReady: parsedDevice?.isReady || false,
        lastReady: parsedDevice?.lastReady || null
      }

      // Base de données
      let childrenCount = 0
      let totalPlaylists = 0
      let lastPlaylist = null
      let recentActivity = null

      if (session?.user) {
        try {
          const { data: children } = await supabase
            .from('children')
            .select('id')
            .eq('parent_id', session.user.id)
          
          childrenCount = children?.length || 0

          const { data: playlists } = await supabase
            .from('playlists')
            .select('id, title, created_at')
            .order('created_at', { ascending: false })
            .limit(1)

          totalPlaylists = playlists?.length || 0
          lastPlaylist = playlists?.[0]?.title || null

          const { data: history } = await supabase
            .from('play_history')
            .select('started_at')
            .order('started_at', { ascending: false })
            .limit(1)

          recentActivity = history?.[0]?.started_at || null
        } catch (dbError) {
          console.warn('Database queries failed:', dbError)
        }
      }

      const database = {
        childrenCount,
        lastPlaylist,
        totalPlaylists,
        recentActivity
      }

      // LocalStorage analysis
      const keys = Object.keys(localStorage)
      const sizes: Record<string, number> = {}
      let totalSize = 0

      keys.forEach(key => {
        const value = localStorage.getItem(key) || ''
        const size = new Blob([value]).size
        sizes[key] = size
        totalSize += size
      })

      const localStorageData = {
        keys,
        sizes,
        totalSize
      }

      // Informations système
      const system = {
        userAgent: navigator.userAgent.slice(0, 100) + '...',
        timestamp: new Date().toISOString(),
        host: window.location.host,
        pathname: window.location.pathname
      }

      setDebugData({
        supabaseSession,
        spotifyStatus,
        spotifyDevice,
        database,
        localStorage: localStorageData,
        system
      })

    } catch (error) {
      console.error('Debug data loading failed:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('fr-FR')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-green-400 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <h2 className="text-xl font-mono">Loading debug data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-red-400 flex items-center justify-center p-4">
        <div className="text-center">
          <Bug className="w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-mono mb-2">Debug Error</h2>
          <p className="font-mono">{error}</p>
          <button
            onClick={loadDebugData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded font-mono hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!debugData) return null

  return (
    <div className="min-h-screen bg-gray-900 text-green-400 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Bug className="w-8 h-8" />
            <h1 className="text-3xl font-mono font-bold">PATOU DEBUG CONSOLE</h1>
          </div>
          <p className="font-mono text-green-300">
            System diagnostics • {formatDate(debugData.system.timestamp)}
          </p>
          <p className="font-mono text-xs text-gray-500 mt-2">
            Host: {debugData.system.host} • Token: {token.slice(0, 8)}...
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Supabase Session */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Database className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">SUPABASE SESSION</h2>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Authenticated:</span>
                <span className={debugData.supabaseSession.isAuthenticated ? 'text-green-400' : 'text-red-400'}>
                  {debugData.supabaseSession.isAuthenticated ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>User ID:</span>
                <span className="text-yellow-400">{debugData.supabaseSession.userId || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Email:</span>
                <span className="text-yellow-400">{debugData.supabaseSession.email || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Provider:</span>
                <span className="text-blue-400">{debugData.supabaseSession.provider || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Sign In:</span>
                <span className="text-gray-400">{formatDate(debugData.supabaseSession.lastSignIn)}</span>
              </div>
            </div>
          </div>

          {/* Spotify Status */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Music className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">SPOTIFY STATUS</h2>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Connected:</span>
                <span className={debugData.spotifyStatus.connected ? 'text-green-400' : 'text-red-400'}>
                  {debugData.spotifyStatus.connected ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has Tokens:</span>
                <span className={debugData.spotifyStatus.hasTokens ? 'text-green-400' : 'text-red-400'}>
                  {debugData.spotifyStatus.hasTokens ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Can Refresh:</span>
                <span className={debugData.spotifyStatus.canRefresh ? 'text-green-400' : 'text-red-400'}>
                  {debugData.spotifyStatus.canRefresh ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Refresh:</span>
                <span className="text-gray-400">{formatDate(debugData.spotifyStatus.lastRefresh)}</span>
              </div>
            </div>
          </div>

          {/* Spotify Device */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Shield className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">SPOTIFY DEVICE</h2>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Device ID:</span>
                <span className="text-yellow-400">{debugData.spotifyDevice.deviceId || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Device Name:</span>
                <span className="text-blue-400">{debugData.spotifyDevice.deviceName || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Is Ready:</span>
                <span className={debugData.spotifyDevice.isReady ? 'text-green-400' : 'text-red-400'}>
                  {debugData.spotifyDevice.isReady ? 'TRUE' : 'FALSE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last Ready:</span>
                <span className="text-gray-400">{formatDate(debugData.spotifyDevice.lastReady)}</span>
              </div>
            </div>
          </div>

          {/* Database Stats */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">DATABASE STATS</h2>
            </div>
            <div className="space-y-2 font-mono text-sm">
              <div className="flex justify-between">
                <span>Children Count:</span>
                <span className="text-yellow-400">{debugData.database.childrenCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Playlists:</span>
                <span className="text-yellow-400">{debugData.database.totalPlaylists}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Playlist:</span>
                <span className="text-blue-400">{debugData.database.lastPlaylist || 'NULL'}</span>
              </div>
              <div className="flex justify-between">
                <span>Recent Activity:</span>
                <span className="text-gray-400">{formatDate(debugData.database.recentActivity)}</span>
              </div>
            </div>
          </div>

          {/* LocalStorage */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">LOCALSTORAGE ANALYSIS</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-mono text-green-300 mb-2">Storage Keys ({debugData.localStorage.keys.length})</h3>
                <div className="space-y-1 font-mono text-xs max-h-40 overflow-y-auto">
                  {debugData.localStorage.keys.map(key => (
                    <div key={key} className="flex justify-between">
                      <span className="text-yellow-400 truncate">{key}</span>
                      <span className="text-gray-400 ml-2">{formatBytes(debugData.localStorage.sizes[key])}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-mono text-green-300 mb-2">Storage Summary</h3>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between">
                    <span>Total Size:</span>
                    <span className="text-yellow-400">{formatBytes(debugData.localStorage.totalSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Keys:</span>
                    <span className="text-yellow-400">{debugData.localStorage.keys.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Size/Key:</span>
                    <span className="text-yellow-400">
                      {debugData.localStorage.keys.length > 0 
                        ? formatBytes(debugData.localStorage.totalSize / debugData.localStorage.keys.length)
                        : '0 B'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Info */}
          <div className="bg-gray-800 border border-green-500 rounded-lg p-6 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Bug className="w-6 h-6" />
              <h2 className="text-xl font-mono font-bold">SYSTEM INFO</h2>
            </div>
            <div className="space-y-2 font-mono text-xs">
              <div>
                <span className="text-green-300">User Agent:</span>
                <div className="text-gray-400 break-all">{debugData.system.userAgent}</div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <span className="text-green-300">Host:</span>
                  <div className="text-yellow-400">{debugData.system.host}</div>
                </div>
                <div>
                  <span className="text-green-300">Pathname:</span>
                  <div className="text-yellow-400">{debugData.system.pathname}</div>
                </div>
                <div>
                  <span className="text-green-300">Timestamp:</span>
                  <div className="text-gray-400">{formatDate(debugData.system.timestamp)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Raw JSON */}
        <div className="mt-8 bg-gray-800 border border-green-500 rounded-lg p-6">
          <h2 className="text-xl font-mono font-bold mb-4">RAW DEBUG DATA</h2>
          <pre className="text-xs text-green-300 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="font-mono text-xs text-gray-500">
            Debug console • No secrets exposed • Session anonymized
          </p>
          <button
            onClick={loadDebugData}
            className="mt-2 px-4 py-2 bg-green-600 text-black rounded font-mono hover:bg-green-500"
          >
            REFRESH DATA
          </button>
        </div>
      </div>
    </div>
  )
}