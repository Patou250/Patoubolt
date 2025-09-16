import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, SALT_ROUNDS)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash)
}

export function generateChildSessionToken(childId: string, parentId: string): string {
  const payload = {
    childId,
    parentId,
    timestamp: Date.now()
  }
  return btoa(JSON.stringify(payload))
}

export function verifyChildSessionToken(token: string): { childId: string; parentId: string } | null {
  try {
    const payload = JSON.parse(atob(token))
    
    // Check if token is less than 24 hours old
    if (Date.now() - payload.timestamp > 24 * 60 * 60 * 1000) {
      return null
    }
    
    return {
      childId: payload.childId,
      parentId: payload.parentId
    }
  } catch {
    return null
  }
}