import { supabase } from '../lib/supabase'
import { getStoredTokens as getSpotifyTokens } from './spotify-auth'

// Types
interface Parent {
  id: string
  email: string
  spotify_id: string
  refresh_token: string
  created_at?: string
  updated_at?: string
}

interface SpotifyUser {
  id: string
  email: string
  display_name: string
}

// Parent session management
interface ParentSession {
  parent: {
    id: string
    email: string
    spotify_id: string
  }
  timestamp: number
}

// Child session management
interface ChildSession {
  child: {
    id: string
    name: string
    emoji: string
    parent_id: string
  }
}

const PARENT_SESSION_KEY = 'patou_parent_session'
const CHILD_SESSION_KEY = 'patou_child_session'

function setParentSession(session: ParentSession): void {
  try {
    console.log('💾 Sauvegarde de la session parent...')
    localStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session))
    
    // Vérification immédiate
    const saved = localStorage.getItem(PARENT_SESSION_KEY)
    console.log('✅ Session parent sauvegardée:', !!saved)
  } catch (error) {
    console.error('❌ Erreur sauvegarde session parent:', error)
  }
}

export { setParentSession }
export function getParentSession(): ParentSession | null {
  try {
    const stored = localStorage.getItem(PARENT_SESSION_KEY)
    if (!stored) return null
    
    const session = JSON.parse(stored)
    
    // Check if session is less than 24 hours old
    if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
      clearParentSession()
      return null
    }
    
    return session
  } catch {
    clearParentSession()
    return null
  }
}

export function clearParentSession(): void {
  localStorage.removeItem(PARENT_SESSION_KEY)
  // Les tokens Spotify restent pour les enfants
  console.log('Parent session cleared, Spotify tokens preserved')
}

function setChildSession(session: ChildSession): void {
  try {
    localStorage.setItem(CHILD_SESSION_KEY, JSON.stringify(session))
  } catch (error) {
    // Silent error handling
  }
}

function getChildSession(): ChildSession | null {
  try {
    const stored = localStorage.getItem(CHILD_SESSION_KEY)
    if (!stored) return null
    
    const session = JSON.parse(stored) as ChildSession
    return session
  } catch {
    return null
  }
}

function clearChildSession(): void {
  localStorage.removeItem(CHILD_SESSION_KEY)
}

function isParentAuthenticated(): boolean {
  return getParentSession() !== null
}

function isChildAuthenticated(): boolean {
  return getChildSession() !== null
}

// Export Spotify tokens function for child access
function getStoredTokens() {
  return getSpotifyTokens()
}

// Spotify API functions
async function getSpotifyUserProfile(accessToken: string): Promise<SpotifyUser> {
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Spotify user profile')
  }

  return response.json()
}

async function createOrUpdateParent(user: SpotifyUser, refreshToken: string): Promise<Parent> {
  const { data, error } = await supabase
    .from('parents')
    .upsert({
      email: user.email,
      spotify_id: user.id,
      refresh_token: refreshToken,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'spotify_id'
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create/update parent: ${error.message}`)
  }

  return data
}

// Token refresh utility
async function refreshParentToken(): Promise<boolean> {
  const session = getParentSession()
  if (!session) return false

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: session.refresh_token,
        client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
      })
    })

    if (!response.ok) {
      clearParentSession()
      return false
    }

    const data = await response.json()
    
    const newSession: ParentSession = {
      ...session,
      access_token: data.access_token,
      expires_at: Date.now() + (data.expires_in * 1000)
    }

    setParentSession(newSession)
    return true
  } catch (error) {
    clearParentSession()
    return false
  }
}