import { useState, useCallback } from 'react'
import { spotifySearch } from '../spotify-search'

interface Track {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string }>
  }
  duration_ms: number
  explicit: boolean
  preview_url: string | null
  popularity: number
}

interface SearchState {
  results: Track[]
  loading: boolean
  error: string | null
  query: string
}

export function useSpotifySearch() {
  const [state, setState] = useState<SearchState>({
    results: [],
    loading: false,
    error: null,
    query: ''
  })

  const search = useCallback(async (query: string, limit: number = 20) => {
    if (!query.trim()) {
      setState(prev => ({ ...prev, results: [], query: '' }))
      return
    }

    setState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null, 
      query: query.trim() 
    }))

    try {
      console.log('🔍 Searching for:', query)
      const results = await spotifySearch.searchTracks(query.trim(), limit)
      
      setState(prev => ({
        ...prev,
        results,
        loading: false,
        error: null
      }))

      console.log('✅ Search completed:', results.length, 'results')
    } catch (error) {
      console.error('❌ Search error:', error)
      setState(prev => ({
        ...prev,
        results: [],
        loading: false,
        error: error instanceof Error ? error.message : 'Search failed'
      }))
    }
  }, [])

  const clearResults = useCallback(() => {
    setState({
      results: [],
      loading: false,
      error: null,
      query: ''
    })
  }, [])

  return {
    ...state,
    search,
    clearResults
  }
}