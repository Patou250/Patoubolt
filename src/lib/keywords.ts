import { supabaseAdmin } from './supabaseAdmin'

interface DenylistTerm {
  id: string
  term: string
  category: string
  severity: 'low' | 'medium' | 'high'
  created_at: string
}

interface KeywordMatch {
  term: string
  category: string
  severity: 'low' | 'medium' | 'high'
  positions: number[]
}

export async function loadDenylist(): Promise<DenylistTerm[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('rules_denylist')
      .select('*')
      .order('term')

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error loading denylist:', error)
    return []
  }
}

export function scanKeywords(text: string, terms: DenylistTerm[]): KeywordMatch[] {
  const matches: KeywordMatch[] = []
  const lowerText = text.toLowerCase()

  for (const term of terms) {
    const lowerTerm = term.term.toLowerCase()
    const positions: number[] = []
    
    let index = lowerText.indexOf(lowerTerm)
    while (index !== -1) {
      positions.push(index)
      index = lowerText.indexOf(lowerTerm, index + 1)
    }

    if (positions.length > 0) {
      matches.push({
        term: term.term,
        category: term.category,
        severity: term.severity,
        positions
      })
    }
  }

  return matches
}

export function mask(term: string): string {
  if (term.length <= 2) {
    return '*'.repeat(term.length)
  }
  
  const firstChar = term[0]
  const lastChar = term[term.length - 1]
  const middleLength = term.length - 2
  
  return `${firstChar}${'*'.repeat(middleLength)}${lastChar}`
}