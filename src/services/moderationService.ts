import { supabaseAdmin } from '../lib/supabaseAdmin'
import { spotifyClient } from '../lib/spotify'
import { findLyricsByTitleArtist } from '../lib/audd'
import { moderationScores } from '../lib/moderation'
import { loadDenylist, scanKeywords } from '../lib/keywords'

interface ModerationRequest {
  spotify_track_id: string
  profile_id?: string
  source?: string
}

interface ModerationResult {
  decision: 'allow' | 'block' | 'review'
  rules_fired: string[]
  scores: Record<string, number>
  track_info?: {
    id: string
    name: string
    artist: string
    explicit: boolean
    popularity: number
    duration_ms: number
  }
}

export async function moderateTrack(request: ModerationRequest): Promise<ModerationResult> {
  const { spotify_track_id, profile_id, source = 'manual' } = request
  
  try {
    // 1. Fetch Spotify metadata
    const track = await spotifyClient.getTrack(spotify_track_id)
    const trackInfo = {
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      explicit: track.explicit,
      popularity: track.popularity,
      duration_ms: track.duration_ms
    }

    // 2. Get lyrics
    const lyrics = await findLyricsByTitleArtist(track.name, trackInfo.artist)
    
    // 3. Load denylist and scan keywords
    const denylist = await loadDenylist()
    const textToScan = `${track.name} ${trackInfo.artist} ${lyrics || ''}`.toLowerCase()
    const keywordMatches = scanKeywords(textToScan, denylist)
    
    // 4. OpenAI Moderation
    const moderation = await moderationScores(textToScan)
    
    // 5. Determine decision and rules fired
    const rulesFired: string[] = []
    let decision: 'allow' | 'block' | 'review' = 'allow'
    
    // Check explicit flag
    if (track.explicit) {
      rulesFired.push('explicit_content')
      decision = 'block'
    }
    
    // Check keyword matches
    if (keywordMatches.length > 0) {
      const highSeverityMatches = keywordMatches.filter(m => m.severity === 'high')
      const mediumSeverityMatches = keywordMatches.filter(m => m.severity === 'medium')
      
      if (highSeverityMatches.length > 0) {
        rulesFired.push('high_severity_keywords')
        decision = 'block'
      } else if (mediumSeverityMatches.length > 0) {
        rulesFired.push('medium_severity_keywords')
        decision = decision === 'allow' ? 'review' : decision
      } else {
        rulesFired.push('low_severity_keywords')
        decision = decision === 'allow' ? 'review' : decision
      }
    }
    
    // Check OpenAI moderation
    if (moderation.flagged) {
      const flaggedCategories = Object.entries(moderation.categories)
        .filter(([_, flagged]) => flagged)
        .map(([category]) => category)
      
      rulesFired.push(`openai_moderation: ${flaggedCategories.join(', ')}`)
      decision = 'block'
    }
    
    // High scores even if not flagged
    const highScoreCategories = Object.entries(moderation.scores)
      .filter(([_, score]) => score > 0.7)
      .map(([category]) => category)
    
    if (highScoreCategories.length > 0 && decision === 'allow') {
      rulesFired.push(`high_moderation_scores: ${highScoreCategories.join(', ')}`)
      decision = 'review'
    }
    
    // 6. Save to database
    await supabaseAdmin
      .from('moderation_events')
      .insert({
        spotify_track_id,
        profile_id,
        source,
        decision,
        rules_fired: rulesFired,
        moderation_scores: moderation.scores,
        track_metadata: trackInfo,
        lyrics_found: !!lyrics,
        keyword_matches: keywordMatches.map(m => ({
          term: m.term,
          category: m.category,
          severity: m.severity,
          count: m.positions.length
        }))
      })
    
    return {
      decision,
      rules_fired: rulesFired,
      scores: moderation.scores,
      track_info: trackInfo
    }
    
  } catch (error) {
    console.error('Error moderating track:', error)
    
    // Save error to database
    await supabaseAdmin
      .from('moderation_events')
      .insert({
        spotify_track_id,
        profile_id,
        source,
        decision: 'review',
        rules_fired: ['moderation_error'],
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })
    
    throw error
  }
}

export async function getTracksInReview() {
  try {
    const { data, error } = await supabaseAdmin
      .from('moderation_events')
      .select('*')
      .eq('decision', 'review')
      .order('created_at', { ascending: false })
    
    if (error) {
      throw error
    }
    
    return data || []
  } catch (error) {
    console.error('Error fetching tracks in review:', error)
    throw error
  }
}

export async function createOverride(scope: string, type: string, value: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('rules_allowlist')
      .insert({
        scope,
        type,
        value,
        created_at: new Date().toISOString()
      })
      .select()
    
    if (error) {
      throw error
    }
    
    return data[0]
  } catch (error) {
    console.error('Error creating override:', error)
    throw error
  }
}