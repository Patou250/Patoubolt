import { useState } from 'react'

export default function ParentExcluded() {
  const [excluded, setExcluded] = useState(JSON.parse(localStorage.getItem('patou_excluded') || '[]'))

  const reintegrate = (t:any) => {
    setExcluded(excluded.filter((x:any) => x.id !== t.id))
    localStorage.setItem('patou_excluded', JSON.stringify(excluded.filter((x:any) => x.id !== t.id)))
    alert(`${t.name} réintégré`)
  }

  const excludeForever = (t:any) => {
    setExcluded(excluded.filter((x:any) => x.id !== t.id))
    localStorage.setItem('patou_excluded', JSON.stringify(excluded.filter((x:any) => x.id !== t.id)))
    alert(`${t.name} exclu définitivement`)
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Espace exclus</h1>
      <ul className="divide-y">
        {excluded.map((t:any) => (
          <li key={t.id} className="p-2 flex justify-between items-center">
            <span>{t.name} — {t.artist}</span>
            <span>
              <button onClick={()=>reintegrate(t)} className="mr-2">↩️ Réintégrer</button>
              <button onClick={()=>excludeForever(t)}>❌ Définitif</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}