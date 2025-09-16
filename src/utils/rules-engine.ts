import type { ChildRules, TimeWindow, RuleViolation, ChildUsage } from '../types/rules'

export class RulesEngine {
  static isInTimeWindow(rules: ChildRules, timestamp: Date = new Date()): boolean {
    if (!rules.time_windows || rules.time_windows.length === 0) {
      return true // No restrictions = always allowed
    }

    const dow = timestamp.getDay() // 0=Sunday, 1=Monday, etc.
    const timeStr = timestamp.toTimeString().substring(0, 5) // "HH:MM"

    return rules.time_windows.some(window => {
      // Check if current day is in allowed days
      if (!window.dow.includes(dow)) {
        return false
      }

      // Check if current time is within window
      return timeStr >= window.start && timeStr <= window.end
    })
  }

  static hasQuotaRemaining(rules: ChildRules, usage: ChildUsage | null): boolean {
    if (!usage) {
      return true // No usage recorded = quota available
    }

    return usage.minutes_listened < rules.daily_quota_minutes
  }

  static getRemainingQuota(rules: ChildRules, usage: ChildUsage | null): number {
    if (!usage) {
      return rules.daily_quota_minutes
    }

    return Math.max(0, rules.daily_quota_minutes - usage.minutes_listened)
  }

  static isTrackAllowed(rules: ChildRules, trackId: string): boolean {
    // If no whitelist is set, allow all tracks
    if (!rules.whitelist_track_ids || rules.whitelist_track_ids.length === 0) {
      return true
    }

    return rules.whitelist_track_ids.includes(trackId)
  }

  static isPlaylistAllowed(rules: ChildRules, playlistId: string): boolean {
    // If no whitelist is set, allow all playlists
    if (!rules.whitelist_playlist_ids || rules.whitelist_playlist_ids.length === 0) {
      return true
    }

    return rules.whitelist_playlist_ids.includes(playlistId)
  }

  static isExplicitContentAllowed(rules: ChildRules, isExplicit: boolean): boolean {
    if (!rules.explicit_block) {
      return true // Explicit content not blocked
    }

    return !isExplicit // Only allow if content is not explicit
  }

  static validatePlayback(
    rules: ChildRules, 
    usage: ChildUsage | null, 
    trackId?: string, 
    playlistId?: string, 
    isExplicit: boolean = false,
    timestamp: Date = new Date()
  ): RuleViolation | null {
    // Check time window
    if (!this.isInTimeWindow(rules, timestamp)) {
      return {
        type: 'time_window',
        message: 'Écoute non autorisée à cette heure',
        details: { current_time: timestamp.toTimeString().substring(0, 5) }
      }
    }

    // Check quota
    if (!this.hasQuotaRemaining(rules, usage)) {
      return {
        type: 'quota_exceeded',
        message: 'Quota d\'écoute quotidien atteint',
        details: { 
          quota: rules.daily_quota_minutes,
          used: usage?.minutes_listened || 0
        }
      }
    }

    // Check explicit content
    if (!this.isExplicitContentAllowed(rules, isExplicit)) {
      return {
        type: 'explicit_content',
        message: 'Contenu explicite bloqué',
        details: { track_id: trackId }
      }
    }

    // Check whitelist (if track or playlist specified)
    if (trackId && !this.isTrackAllowed(rules, trackId)) {
      return {
        type: 'not_whitelisted',
        message: 'Titre non autorisé',
        details: { track_id: trackId }
      }
    }

    if (playlistId && !this.isPlaylistAllowed(rules, playlistId)) {
      return {
        type: 'not_whitelisted',
        message: 'Playlist non autorisée',
        details: { playlist_id: playlistId }
      }
    }

    return null // All checks passed
  }

  static formatTimeWindows(windows: TimeWindow[]): string {
    const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
    
    return windows.map(window => {
      const days = window.dow.map(d => dayNames[d]).join(', ')
      return `${days}: ${window.start}-${window.end}`
    }).join(' | ')
  }

  static parseTimeWindows(text: string): TimeWindow[] {
    // Simple parser for "Lun-Ven: 16:00-19:00, Sam-Dim: 09:00-20:00" format
    // This is a basic implementation - could be enhanced
    const dayMap: { [key: string]: number } = {
      'dim': 0, 'lun': 1, 'mar': 2, 'mer': 3, 'jeu': 4, 'ven': 5, 'sam': 6
    }

    try {
      return text.split(',').map(part => {
        const [daysPart, timePart] = part.trim().split(':')
        const [start, end] = timePart.trim().split('-')
        
        // Parse days (simplified - assumes ranges like "Lun-Ven")
        const days = daysPart.toLowerCase().includes('-') 
          ? [1, 2, 3, 4, 5] // Default to weekdays for ranges
          : [dayMap[daysPart.toLowerCase().trim()] || 0]

        return {
          dow: days,
          start: start.trim(),
          end: end.trim()
        }
      })
    } catch {
      // Return default if parsing fails
      return [
        { dow: [1, 2, 3, 4, 5], start: "16:00", end: "19:00" },
        { dow: [0, 6], start: "09:00", end: "20:00" }
      ]
    }
  }
}