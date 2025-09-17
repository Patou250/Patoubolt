interface OpenAIModerationResponse {
  id: string
  model: string
  results: Array<{
    flagged: boolean
    categories: {
      sexual: boolean
      hate: boolean
      harassment: boolean
      'self-harm': boolean
      'sexual/minors': boolean
      'hate/threatening': boolean
      'violence/graphic': boolean
      'self-harm/intent': boolean
      'self-harm/instructions': boolean
      'harassment/threatening': boolean
      violence: boolean
    }
    category_scores: {
      sexual: number
      hate: number
      harassment: number
      'self-harm': number
      'sexual/minors': number
      'hate/threatening': number
      'violence/graphic': number
      'self-harm/intent': number
      'self-harm/instructions': number
      'harassment/threatening': number
      violence: number
    }
  }>
}

export async function moderationScores(text: string): Promise<{
  flagged: boolean
  categories: Record<string, boolean>
  scores: Record<string, number>
}> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: text,
        model: 'omni-moderation-latest'
      })
    })

    if (!response.ok) {
      throw new Error(`OpenAI Moderation API error: ${response.status}`)
    }

    const data: OpenAIModerationResponse = await response.json()
    const result = data.results[0]

    return {
      flagged: result.flagged,
      categories: result.categories,
      scores: result.category_scores
    }
  } catch (error) {
    console.error('Error calling OpenAI Moderation API:', error)
    throw error
  }
}