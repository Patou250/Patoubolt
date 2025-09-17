import { useEffect, useState } from 'react'
import { getSpotifyTokens } from '../utils/spotify-tokens'

type Track = { id:string; name:string; artists:{name:string}[]; album:{images:{url:string}[]} }

export default function ChildSearch() {
  const [token, setToken] = useState<string>('')
  const [q,setQ] = useState('')
  const [items,setItems] = useState<Track[]>([])
  const [loading,setLoading] = useState(false)
  const [err,setErr] = useState<string|undefined>()

  // 1) Obtenir un access_token depuis localStorage
  useEffect(() => {
    const tokens = getSpotifyTokens()
    if (tokens) {
      setToken(tokens.access_token)
      setErr(undefined)
    } else {
      setErr('Parent non connecté à Spotify — demande-lui de se connecter depuis l\'accueil')
    }
  }, [])

  // 2) Recherche
  const search = async (e?:React.FormEvent) => {
    e?.preventDefault()
    setItems([])
    setErr(undefined)
    if (!token) { 
      setErr('Pas de token — demande au parent de se connecter à Spotify depuis l\'accueil')
      return 
    }
    if (!q.trim()) return
    setLoading(true)
    try {
      const r = await fetch(`https://api.spotify.com/v1/search?type=track&limit=25&q=${encodeURIComponent(q)}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const d = await r.json()
      if (r.status === 401) { 
        setErr('Token expiré — demande au parent de se reconnecter à Spotify')
        setToken('')
        return 
      }
      if (!r.ok) {
        setErr(`Erreur de recherche: ${r.status}`)
        return
      }
      setItems(d?.tracks?.items || [])
    } catch (e:any) {
      setErr(`Erreur de recherche: ${e.message || 'unknown'}`)
    } finally {
      setLoading(false)
    }
  }

  // 3) Actions locales: like + add to child playlist
  const like = (t:Track) => {
    const payload = { trackId:t.id, name:t.name, artist:t.artists.map(a=>a.name).join(', '), cover:t.album.images?.[0]?.url||'', ts:Date.now() }
    const raw = localStorage.getItem('patou_favorites'); const map = raw?JSON.parse(raw):{}
    map[t.id] = payload
    localStorage.setItem('patou_favorites', JSON.stringify(map))
    
    // Feedback visuel
    const button = document.activeElement as HTMLButtonElement
    if (button) {
      const original = button.textContent
      button.textContent = '💚'
      setTimeout(() => button.textContent = original, 1000)
    }
  }
  
  const addToPlaylist = (t:Track) => {
    const name = prompt('Ajouter à quelle playlist ? (ou nouveau nom)')
    if (!name) return
    const raw = localStorage.getItem('patou_child_playlists'); const all = raw?JSON.parse(raw):{}
    const pl = all[name] || { name, tracks:[] }
    if (!pl.tracks.find((x:any)=>x.trackId===t.id)) {
      pl.tracks.push({ trackId:t.id, name:t.name, artist:t.artists.map(a=>a.name).join(', '), cover:t.album.images?.[0]?.url||'' })
    }
    all[name] = pl
    localStorage.setItem('patou_child_playlists', JSON.stringify(all))
    
    // Feedback visuel
    alert(`"${t.name}" ajouté à la playlist "${name}" !`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-xl font-semibold mb-4">Rechercher des chansons</h1>

      {err && (
        <div className="mb-4 p-3 border border-yellow-400 bg-yellow-50 text-sm rounded-lg">
          <div className="font-medium text-yellow-800">⚠️ {err}</div>
          {!token && (
            <div className="mt-2 text-yellow-700">
              Le parent doit se connecter à Spotify depuis la page d'accueil pour que la recherche fonctionne.
            </div>
          )}
        </div>
      )}

      <form onSubmit={search} className="flex gap-2 mb-4">
        <input
          value={q}
          onChange={e=>setQ(e.target.value)}
          placeholder={token ? "Titre, artiste…" : "Connexion parent Spotify requise"}
          className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!token}
        />
        <button 
          className="px-4 py-2 bg-black text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors" 
          disabled={!token || loading}
        >
          {loading ? 'Recherche…' : 'Rechercher'}
        </button>
      </form>

      {items.length === 0 && q && !loading && !err && (
        <div className="text-center py-8 text-gray-500">
          Aucun résultat pour "{q}"
        </div>
      )}

      <ul className="divide-y border rounded-lg bg-white">
        {items.map(t=>(
          <li key={t.id} className="p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            {t.album.images?.[0]?.url && (
              <img 
                src={t.album.images[0].url} 
                className="w-10 h-10 rounded shadow-sm" 
                alt={`Cover de ${t.name}`}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{t.name}</div>
              <div className="text-sm text-gray-500 truncate">{t.artists.map(a=>a.name).join(', ')}</div>
            </div>
            <div className="flex items-center gap-2">
              <a 
                href={`/player?trackId=${t.id}`} 
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                ▶️ Lire
              </a>
              <button 
                onClick={()=>like(t)} 
                className="text-sm hover:scale-110 transition-transform"
                title="Ajouter aux favoris"
              >
                ❤️
              </button>
              <button 
                onClick={()=>addToPlaylist(t)} 
                className="text-sm text-green-600 hover:text-green-800 underline"
                title="Ajouter à une playlist"
              >
                + Playlist
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}