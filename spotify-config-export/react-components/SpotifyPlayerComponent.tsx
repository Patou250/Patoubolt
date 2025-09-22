import React from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart } from 'lucide-react'
import { useSpotifyPlayer } from '../react-hooks/useSpotifyPlayer'

interface SpotifyPlayerComponentProps {
  className?: string
  onTrackChange?: (trackId: string) => void
}

export default function SpotifyPlayerComponent({ 
  className = '', 
  onTrackChange 
}: SpotifyPlayerComponentProps) {
  const {
    currentTrack,
    isPlaying,
    position,
    duration,
    volume,
    error,
    isReady,
    togglePlayback,
    seekTo,
    setVolume,
    nextTrack,
    previousTrack,
    playTrack
  } = useSpotifyPlayer()

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newPosition = percent * duration
    seekTo(newPosition)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
  }

  const handleAddToFavorites = () => {
    if (!currentTrack) return
    
    try {
      console.log('❤️ Adding to favorites:', currentTrack.name)
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      
      favs[currentTrack.id] = {
        trackId: currentTrack.id,
        name: currentTrack.name,
        artist: currentTrack.artists.map(a => a.name).join(', '),
        cover: currentTrack.album.images?.[0]?.url || '',
        ts: Date.now()
      }
      
      localStorage.setItem('patou_favorites', JSON.stringify(favs))
      console.log('✅ Added to favorites:', currentTrack.name)
      alert('❤️ Ajouté aux favoris !')
    } catch (error) {
      console.error('❌ Error adding to favorites:', error)
    }
  }

  const startDefaultPlayback = async () => {
    console.log('🎵 Starting default playback...')
    // Start with a kid-friendly default track
    await playTrack('3n3Ppam7vgaVa1iaRUc9Lp') // "Hakuna Matata"
  }

  return (
    <div className={`bg-gradient-to-br from-gray-900 to-black text-white rounded-xl p-6 ${className}`}>
      {/* Error Banner */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-sm text-red-200">{error}</p>
          {error.includes('non prêt') && (
            <button
              onClick={startDefaultPlayback}
              className="mt-2 px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
            >
              Démarrer la lecture
            </button>
          )}
        </div>
      )}

      {/* Track Info */}
      {currentTrack ? (
        <div className="flex items-center gap-4 mb-6">
          <img 
            src={currentTrack.album.images[0]?.url || 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100'} 
            alt={currentTrack.album.name}
            className="w-16 h-16 rounded-lg shadow-lg"
          />
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold truncate">{currentTrack.name}</h3>
            <p className="text-gray-300 text-sm truncate">
              {currentTrack.artists.map(a => a.name).join(', ')}
            </p>
            <p className="text-gray-400 text-xs truncate">{currentTrack.album.name}</p>
          </div>
          <button
            onClick={handleAddToFavorites}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Ajouter aux favoris"
          >
            <Heart className="w-5 h-5 text-pink-400" />
          </button>
        </div>
      ) : (
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎵</div>
          <p className="text-gray-300 mb-3">Aucune piste en cours</p>
          <button
            onClick={startDefaultPlayback}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
          >
            Démarrer la lecture
          </button>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
          <span>{formatTime(position)}</span>
          <div
            className="flex-1 bg-gray-700 rounded-full h-2 cursor-pointer"
            onClick={handleProgressClick}
          >
            <div 
              className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all"
              style={{ width: `${duration ? (position / duration) * 100 : 0}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-6 mb-6">
        <button
          onClick={previousTrack}
          disabled={!isReady}
          className="text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <SkipBack className="w-6 h-6" />
        </button>
        
        <button
          onClick={togglePlayback}
          disabled={!isReady}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 disabled:bg-gray-600 text-white rounded-full p-4 transition-all transform hover:scale-105"
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>
        
        <button
          onClick={nextTrack}
          disabled={!isReady}
          className="text-gray-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          <SkipForward className="w-6 h-6" />
        </button>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-5 h-5 text-gray-400" />
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={volume}
          onChange={handleVolumeChange}
          className="flex-1 max-w-32 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, #10b981 0%, #10b981 ${volume}%, #374151 ${volume}%, #374151 100%)`
          }}
        />
        <span className="text-sm text-gray-400 w-8 text-right">
          {Math.round(volume)}%
        </span>
      </div>

      {/* Device Status */}
      {isReady && (
        <div className="mt-4 p-3 bg-green-900/30 border border-green-700/50 rounded-lg">
          <p className="text-green-200 text-sm text-center">
            🎧 Lecteur connecté - Ouvrez Spotify et transférez vers "Patou Player"
          </p>
        </div>
      )}

      {!isReady && !error && (
        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
          <p className="text-yellow-200 text-sm text-center">
            ⏳ Connexion au lecteur Spotify...
          </p>
        </div>
      )}
    </div>
  )
}