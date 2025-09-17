import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Child() {
  useEffect(() => {
    // Si on accède via /direct/child, créer une session factice
    if (window.location.pathname === '/direct/child') {
      const fakeChild = {
        id: 'test-child-id',
        identifier: 'test-child',
        name: 'Enfant Test'
      }
      localStorage.setItem('patou_child', JSON.stringify(fakeChild))
    }
  }, [])

  const lastRaw = localStorage.getItem('patou_last_track')
  const last = lastRaw ? JSON.parse(lastRaw) : null
  const favsRaw = localStorage.getItem('patou_favorites')
  const favMap = favsRaw ? JSON.parse(favsRaw) : {}
  const favs = Object.values(favMap).slice(0,5)
  
  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Continuer</h2>
        {last ? (
          <div className="flex items-center gap-3 p-3 border rounded-lg">
            {last.cover && <img src={last.cover} className="w-12 h-12 rounded" />}
            <div className="flex-1">
              <div className="font-medium">{last.name}</div>
              <div className="text-sm text-gray-500">{last.artist}</div>
            </div>
            <a href={`/player?trackId=${last.trackId}`} className="px-3 py-2 bg-black text-white rounded">Reprendre</a>
          </div>
        ) : <p className="text-gray-500">Rien à reprendre pour l'instant.</p>}
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Mes favoris</h2>
        {favs.length ? (
          <ul className="divide-y border rounded-lg">
            {favs.map((t:any) => (
              <li key={t.trackId} className="p-3 flex items-center gap-3">
                {t.cover && <img src={t.cover} className="w-10 h-10 rounded" />}
                <div className="flex-1">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-sm text-gray-500">{t.artist}</div>
                </div>
                <a href={`/player?trackId=${t.trackId}`} className="text-sm underline">Lire</a>
              </li>
            ))}
          </ul>
        ) : <p className="text-gray-500">Ajoute des favoris avec le ❤️ dans le lecteur.</p>}
      </section>
      
      <section className="space-y-2">
        <h2 className="text-xl font-semibold">Playlist de la semaine</h2>
        <a href="/player" className="inline-block px-4 py-2 bg-black text-white rounded">Écouter</a>
      </section>
      
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/child/search" className="p-4 border rounded-lg text-center hover:bg-gray-50">🔎 Rechercher</Link>
        <Link to="/child/playlists" className="p-4 border rounded-lg text-center hover:bg-gray-50">🎧 Mes playlists</Link>
        <Link to="/child/history" className="p-4 border rounded-lg text-center hover:bg-gray-50">🕒 Historique</Link>
      </section>
    </div>
  )
}