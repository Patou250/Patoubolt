import { useState } from 'react'

export default function ParentHistory() {
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('patou_history') || '[]'))
  const excluded = JSON.parse(localStorage.getItem('patou_excluded') || '[]')

  const like = (t:any) => alert(`👍 ${t.name}`)
  const dislike = (t:any) => {
    const updated = [...excluded, t]
    localStorage.setItem('patou_excluded', JSON.stringify(updated))
    setHistory(history.filter((x:any) => x.id !== t.id))
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Historique</h1>
      <ul className="divide-y">
        {history.map((t:any) => (
          <li key={t.id} className="p-2 flex justify-between items-center">
            <span>{t.name} — {t.artist}</span>
            <span>
              <button onClick={()=>like(t)} className="mr-2">👍</button>
              <button onClick={()=>dislike(t)}>👎</button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}