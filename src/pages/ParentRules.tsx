import { useState } from 'react'

export default function ParentRules() {
  const [maxMinutes, setMaxMinutes] = useState(60)
  const [blockedHours, setBlockedHours] = useState([21,8])
  const [vulgarity, setVulgarity] = useState(0)

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Règles d'écoute</h1>
      <label>Durée max (minutes/jour)</label>
      <input type="number" value={maxMinutes} onChange={e => setMaxMinutes(Number(e.target.value))} className="w-full border px-2 py-1 rounded mb-3"/>
      <label>Plage interdite (heure début - fin)</label>
      <input type="text" value={blockedHours.join('-')} onChange={e => setBlockedHours(e.target.value.split('-').map(Number))} className="w-full border px-2 py-1 rounded mb-3"/>
      <label>Niveau de vulgarité accepté</label>
      <select value={vulgarity} onChange={e => setVulgarity(Number(e.target.value))} className="w-full border px-2 py-1 rounded mb-3">
        <option value={0}>0%</option>
        <option value={10}>10%</option>
        <option value={30}>30%</option>
      </select>
      <button className="w-full bg-black text-white py-2 rounded">Enregistrer</button>
    </div>
  )
}