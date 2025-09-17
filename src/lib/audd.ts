interface AuddLyricsResponse {
  status: string
  result?: {
    lyrics?: string
    title?: string
    artist?: string
  }
}

export async function findLyricsByTitleArtist(title: string, artist: string): Promise<string | null> {
  const apiToken = import.meta.env.AUDD_API_TOKEN || import.meta.env.VITE_AUDD_API_TOKEN
  
  if (!apiToken) {
    console.warn('AUDD API token not configured')
    return null
  }

  try {
    const params = new URLSearchParams({
      api_token: apiToken,
      q: `${artist} ${title}`,
      method: 'findLyrics'
    })

    const response = await fetch(`https://api.audd.io/findLyrics?${params}`)
    
    if (!response.ok) {
      throw new Error(`AudD API error: ${response.status}`)
    }

    const data: AuddLyricsResponse = await response.json()
    
    if (data.status === 'success' && data.result?.lyrics) {
      return data.result.lyrics
    }

    return null
  } catch (error) {
    console.error('Error fetching lyrics from AudD:', error)
    return null
  }
}