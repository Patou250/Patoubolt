export default function ParentCuration() {
  const weekly = JSON.parse(localStorage.getItem('patou_weekly') || '[]')

  const publish = () => {
    localStorage.setItem('patou_weekly_published', JSON.stringify(weekly))
    alert('Playlist de la semaine publiée')
  }

  const createShared = () => {
    const child = prompt('Associer cette playlist avec quel enfant ?')
    if (!child) return
    localStorage.setItem(`patou_shared_${child}`, JSON.stringify(weekly))
    alert(`Playlist commune créée avec ${child}`)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Curation parentale</h1>
      <button onClick={publish} className="px-4 py-2 bg-green-600 text-white rounded mr-2">Publier la playlist</button>
      <button onClick={createShared} className="px-4 py-2 bg-blue-600 text-white rounded">Créer playlist commune</button>
      <ul className="divide-y mt-6">
        {weekly.map((t:any) => (
          <li key={t.id} className="p-2">{t.name} — {t.artist}</li>
        ))}
      </ul>
    </div>
  )
}