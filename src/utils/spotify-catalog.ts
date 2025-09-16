// Utilitaire pour importer le catalogue enfant depuis Spotify
import { getSpotifyTokens } from './spotify-tokens'

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{ name: string }>
  album: {
    name: string
    images: Array<{ url: string; height?: number; width?: number }>
  }
  duration_ms: number
  explicit: boolean
  uri: string
  popularity: number
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string
  images: Array<{ url: string }>
  tracks: {
    total: number
    items: Array<{ track: SpotifyTrack }>
  }
}

export class SpotifyCatalogImporter {
  private accessToken: string

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  // Rechercher des playlists pour enfants
  async searchKidsPlaylists(limit: number = 50): Promise<SpotifyPlaylist[]> {
    const queries = [
      'kids music',
      'children songs',
      'comptines',
      'berceuses',
      'musique enfant',
      'disney kids',
      'family music',
      'nursery rhymes',
      'chansons enfants',
      'musique famille'
    ]

    const allPlaylists: SpotifyPlaylist[] = []
    const seenIds = new Set<string>()

    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist&market=FR&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          }
        )

        if (!response.ok) {
          console.warn(`Search failed for "${query}":`, response.status)
          continue
        }

        const data = await response.json()
        const playlists = data.playlists?.items || []

        for (const playlist of playlists) {
          if (!seenIds.has(playlist.id) && this.isKidsPlaylist(playlist)) {
            seenIds.add(playlist.id)
            allPlaylists.push(playlist)
            
            if (allPlaylists.length >= limit) {
              return allPlaylists
            }
          }
        }
      } catch (error) {
        console.error(`Error searching for "${query}":`, error)
      }
    }

    return allPlaylists
  }

  // Vérifier si une playlist est appropriée pour les enfants
  private isKidsPlaylist(playlist: any): boolean {
    const name = playlist.name.toLowerCase()
    const description = (playlist.description || '').toLowerCase()
    
    const kidsKeywords = [
      'kids', 'children', 'enfant', 'comptines', 'berceuses',
      'disney', 'family', 'nursery', 'bébé', 'baby',
      'cartoon', 'animation', 'lullaby', 'chanson'
    ]

    const adultKeywords = [
      'explicit', 'adult', 'mature', 'party', 'club',
      'workout', 'gym', 'rap', 'hip hop', 'rock'
    ]

    // Doit contenir au moins un mot-clé enfant
    const hasKidsKeyword = kidsKeywords.some(keyword => 
      name.includes(keyword) || description.includes(keyword)
    )

    // Ne doit pas contenir de mots-clés adultes
    const hasAdultKeyword = adultKeywords.some(keyword => 
      name.includes(keyword) || description.includes(keyword)
    )

    return hasKidsKeyword && !hasAdultKeyword
  }

  // Récupérer les tracks d'une playlist
  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=FR&limit=50`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      )

      if (!response.ok) {
        console.warn(`Failed to get tracks for playlist ${playlistId}:`, response.status)
        return []
      }

      const data = await response.json()
      const tracks = data.items || []

      return tracks
        .map((item: any) => item.track)
        .filter((track: any) => track && track.id && !track.explicit) // Filtrer le contenu explicite
        .filter((track: any) => this.isKidsTrack(track))
    } catch (error) {
      console.error(`Error getting tracks for playlist ${playlistId}:`, error)
      return []
    }
  }

  // Vérifier si une chanson est appropriée pour les enfants
  private isKidsTrack(track: any): boolean {
    if (track.explicit) return false

    const name = track.name.toLowerCase()
    const artist = track.artists?.[0]?.name?.toLowerCase() || ''
    
    const kidsArtists = [
      'disney', 'pixar', 'dreamworks', 'sesame street',
      'comptines', 'berceuses', 'enfants', 'kids',
      'cocomelon', 'super simple songs', 'little baby bum'
    ]

    const inappropriateWords = [
      'explicit', 'parental', 'adult', 'mature',
      'violence', 'drug', 'alcohol', 'sex'
    ]

    // Vérifier les artistes appropriés
    const hasKidsArtist = kidsArtists.some(artist_name => 
      artist.includes(artist_name)
    )

    // Vérifier les mots inappropriés
    const hasInappropriateContent = inappropriateWords.some(word => 
      name.includes(word) || artist.includes(word)
    )

    return !hasInappropriateContent && (hasKidsArtist || track.popularity > 30)
  }

  // Importer tout le catalogue enfant
  async importKidsCatalog(maxTracks: number = 200): Promise<SpotifyTrack[]> {
    console.log('🎵 Début de l\'import du catalogue enfant...')
    
    const playlists = await this.searchKidsPlaylists(20)
    console.log(`📝 ${playlists.length} playlists trouvées`)

    const allTracks: SpotifyTrack[] = []
    const seenTrackIds = new Set<string>()

    for (const playlist of playlists) {
      if (allTracks.length >= maxTracks) break

      console.log(`🎶 Import de "${playlist.name}"...`)
      const tracks = await this.getPlaylistTracks(playlist.id)
      
      for (const track of tracks) {
        if (allTracks.length >= maxTracks) break
        
        if (!seenTrackIds.has(track.id)) {
          seenTrackIds.add(track.id)
          allTracks.push(track)
        }
      }

      // Pause pour éviter les limites de taux
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    console.log(`✅ Import terminé: ${allTracks.length} chansons`)
    return allTracks
  }

  // Rechercher directement des chansons pour enfants
  async searchKidsTracks(limit: number = 50): Promise<SpotifyTrack[]> {
    const queries = [
      'disney songs kids',
      'comptines françaises',
      'berceuses enfants',
      'nursery rhymes',
      'children music popular',
      'musique enfant française',
      'kids songs english',
      'cartoon theme songs'
    ]

    const allTracks: SpotifyTrack[] = []
    const seenIds = new Set<string>()

    for (const query of queries) {
      if (allTracks.length >= limit) break

      try {
        const response = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=FR&limit=20`,
          {
            headers: {
              'Authorization': `Bearer ${this.accessToken}`
            }
          }
        )

        if (!response.ok) continue

        const data = await response.json()
        const tracks = data.tracks?.items || []

        for (const track of tracks) {
          if (allTracks.length >= limit) break
          
          if (!seenIds.has(track.id) && !track.explicit && this.isKidsTrack(track)) {
            seenIds.add(track.id)
            allTracks.push(track)
          }
        }
      } catch (error) {
        console.error(`Error searching tracks for "${query}":`, error)
      }
    }

    return allTracks
  }
}

// Fonction utilitaire pour importer le catalogue
export async function importSpotifyKidsCatalog(): Promise<SpotifyTrack[]> {
  const tokens = getSpotifyTokens()
  if (!tokens) {
    throw new Error('Aucun token Spotify disponible')
  }

  const importer = new SpotifyCatalogImporter(tokens.access_token)
  
  // Combiner les résultats des playlists et de la recherche directe
  const [playlistTracks, searchTracks] = await Promise.all([
    importer.importKidsCatalog(150),
    importer.searchKidsTracks(50)
  ])

  // Fusionner et dédupliquer
  const allTracks = [...playlistTracks]
  const seenIds = new Set(playlistTracks.map(t => t.id))

  for (const track of searchTracks) {
    if (!seenIds.has(track.id)) {
      allTracks.push(track)
    }
  }

  return allTracks.slice(0, 200) // Limiter à 200 chansons
}