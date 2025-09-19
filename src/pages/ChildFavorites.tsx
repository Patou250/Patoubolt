import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { App, Page, Navbar, Block, List, ListItem, Toolbar, Button } from 'konsta/react'
import { Heart, Play, Search, Shuffle } from 'lucide-react'

interface FavoriteTrack {
  trackId: string
  name: string
  artist: string
  cover: string
  ts: number
}

export default function ChildFavorites() {
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = () => {
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      if (favsRaw) {
        const favsData = JSON.parse(favsRaw)
        const favsList = Object.values(favsData) as FavoriteTrack[]
        // Trier par date d'ajout (plus récent en premier)
        favsList.sort((a, b) => b.ts - a.ts)
        setFavorites(favsList)
      } else {
        // Favoris factices pour la démo
        const mockFavorites: FavoriteTrack[] = [
          {
            trackId: '1',
            name: 'Hakuna Matata',
            artist: 'Le Roi Lion',
            cover: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=100',
            ts: Date.now() - 1000000
          },
          {
            trackId: '2',
            name: 'Let It Go',
            artist: 'La Reine des Neiges',
            cover: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=100',
            ts: Date.now() - 2000000
          },
          {
            trackId: '3',
            name: 'Under the Sea',
            artist: 'La Petite Sirène',
            cover: 'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=100',
            ts: Date.now() - 3000000
          }
        ]
        setFavorites(mockFavorites)
      }
    } catch (error) {
      console.error('Erreur chargement favoris:', error)
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  const handlePlayTrack = (trackId: string) => {
    console.log('Playing track:', trackId)
    // Ici on pourrait envoyer la piste au PlayerSdk
    // Par exemple via un context ou un service global
  }

  const handleToggleFavorite = (trackId: string) => {
    try {
      const favsRaw = localStorage.getItem('patou_favorites')
      const favs = favsRaw ? JSON.parse(favsRaw) : {}
      
      if (favs[trackId]) {
        // Retirer des favoris
        delete favs[trackId]
      } else {
        // Ajouter aux favoris (ne devrait pas arriver ici mais au cas où)
        const track = favorites.find(f => f.trackId === trackId)
        if (track) {
          favs[trackId] = track
        }
      }
      
      localStorage.setItem('patou_favorites', JSON.stringify(favs))
      loadFavorites() // Recharger la liste
    } catch (error) {
      console.error('Erreur toggle favori:', error)
    }
  }

  const handleShufflePlay = () => {
    if (favorites.length > 0) {
      // Mélanger et jouer tous les favoris
      const shuffled = [...favorites].sort(() => Math.random() - 0.5)
      console.log('Shuffle play:', shuffled.map(f => f.trackId))
      // Ici on pourrait envoyer la playlist mélangée au PlayerSdk
    }
  }

  if (loading) {
    return (
      <App theme="ios">
        <Page>
          <Navbar title="Favoris" />
          <Block className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement des favoris...</p>
          </Block>
        </Page>
      </App>
    )
  }

  return (
    <App theme="ios">
      <Page>
        <Navbar title="Favoris" />
        
        {favorites.length === 0 ? (
          // Empty state
          <Block className="text-center py-12">
            <div className="text-6xl mb-6">💖</div>
            <h3 className="text-xl font-bold text-gray-700 mb-3">Aucun favori</h3>
            <p className="text-gray-600 mb-6 px-4">
              Découvre de nouvelles chansons et ajoute-les à tes favoris en tapant sur ♥
            </p>
            <Link to="/child/search">
              <Button className="bg-primary text-white">
                <Search className="w-4 h-4 mr-2" />
                Rechercher de la musique
              </Button>
            </Link>
          </Block>
        ) : (
          <>
            {/* Liste des favoris */}
            <List mediaList>
              {favorites.map((track) => (
                <ListItem
                  key={track.trackId}
                  title={track.name}
                  text={track.artist}
                  media={
                    <img 
                      src={track.cover} 
                      alt={track.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  }
                  after={
                    <div className="flex items-center gap-2">
                      <Button 
                        className="bg-share text-white min-h-[48px] min-w-[48px] rounded-full"
                        onClick={() => handleToggleFavorite(track.trackId)}
                        title="Retirer des favoris"
                      >
                        <Heart className="w-4 h-4 fill-current" />
                      </Button>
                      <Button 
                        className="bg-primary text-white min-h-[48px] min-w-[48px] rounded-full"
                        onClick={() => handlePlayTrack(track.trackId)}
                        title="Écouter"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  }
                />
              ))}
            </List>

            {/* Toolbar avec lecture aléatoire */}
            <Toolbar bottom className="bg-white border-t border-gray-200">
              <div className="flex items-center justify-center w-full py-2">
                <Button 
                  className="bg-awaken text-gray-900 px-6"
                  onClick={handleShufflePlay}
                >
                  <Shuffle className="w-4 h-4 mr-2" />
                  Lecture aléatoire ({favorites.length} titres)
                </Button>
              </div>
            </Toolbar>
          </>
        )}
      </Page>
    </App>
  )
}