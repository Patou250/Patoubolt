import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ChildLogin() {
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || pin.length !== 4 || !/^\d{4}$/.test(pin)) return
    localStorage.setItem('patou_child', JSON.stringify({ name, pin }))
    nav('/child')
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4">
      <h1 className="text-xl font-semibold">Espace enfant</h1>
      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        placeholder="Prénom"
        value={name}
        onChange={e=>setName(e.target.value)}
      />
      <input
        className="w-full border border-gray-300 rounded-lg px-3 py-2"
        placeholder="PIN (4 chiffres)"
        value={pin}
        onChange={e=>setPin(e.target.value.replace(/\D/g,''))}
        maxLength={4}
      />
      <button className="w-full bg-black text-white rounded-lg px-3 py-2 font-medium">Entrer</button>
    </form>
  )
}