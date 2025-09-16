import { supabase } from '../lib/supabase'
import { verifyPin, generateChildSessionToken, verifyChildSessionToken } from './crypto'
import type { Child } from '../types/child'

export async function getChildrenForParent(parentId: string): Promise<Child[]> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true })

  if (error) {
    throw error
  }

  return data || []
}

export async function verifyChildLogin(childId: string, pin: string): Promise<Child | null> {
  const { data, error } = await supabase
    .from('children')
    .select('*')
    .eq('id', childId)
    .single()

  if (error || !data) {
    return null
  }

  const isValidPin = await verifyPin(pin, data.pin_hash)
  if (!isValidPin) {
    return null
  }

  return data
}

export function setChildSession(childId: string, parentId: string): void {
  const token = generateChildSessionToken(childId, parentId)
  
  // Set httpOnly cookie (simulated with secure localStorage for demo)
  // In production, this would be set as an httpOnly cookie on the server
  const sessionData = {
    token,
    childId,
    parentId,
    timestamp: Date.now()
  }
  
  localStorage.setItem('child_session', JSON.stringify(sessionData))
  
  // Also set a simple cookie for server-side access simulation
  document.cookie = `childSession=${token}; path=/; max-age=86400; secure; samesite=strict`
}

export function getChildSession(): { childId: string; parentId: string } | null {
  // Try localStorage first (for demo)
  const sessionData = localStorage.getItem('child_session')
  if (sessionData) {
    try {
      const session = JSON.parse(sessionData)
      
      // Check if session is less than 24 hours old
      if (Date.now() - session.timestamp > 24 * 60 * 60 * 1000) {
        clearChildSession()
        return null
      }
      
      return {
        childId: session.childId,
        parentId: session.parentId
      }
    } catch {
      clearChildSession()
      return null
    }
  }

  // Fallback to cookie parsing
  const cookies = document.cookie.split(';')
  const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('childSession='))
  
  if (sessionCookie) {
    const token = sessionCookie.split('=')[1]
    return verifyChildSessionToken(token)
  }

  return null
}

export function clearChildSession(): void {
  localStorage.removeItem('child_session')
  document.cookie = 'childSession=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
}

export function isChildAuthenticated(): boolean {
  return getChildSession() !== null
}