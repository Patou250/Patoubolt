import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ChildLogin(){
  const [name,setName]=useState(''); const [pin,setPin]=useState('')
  const [err,setErr]=useState<string| null>(null)
  const nav=useNavigate()

  const login = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(null)
    
    // Hash the PIN to match stored format
    const pinHash = btoa(pin)
    
    const { data, error } = await supabase.from('children')
      .select('id, name, emoji, pin_hash')
      .eq('name', name).eq('pin_hash', pinHash).maybeSingle()
    if (error || !data) { setErr('Nom ou PIN invalide'); return }
    localStorage.setItem('patou_child', JSON.stringify({ id:data.id, name:data.name, emoji:data.emoji }))
    nav('/child')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Connexion enfant</h1>
      {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm">{err}</div>}
      <form onSubmit={login} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Nom de l'enfant" value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} />
        <button className="w-full bg-green-600 text-white rounded py-2">Se connecter</button>
      </form>
    </div>
  )
}