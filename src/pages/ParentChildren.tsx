import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Child = { id:string; name:string; pin_hash:string; parent_id:string; emoji:string; created_at:string; updated_at:string }

export default function ParentChildren(){
  const [userId,setUserId]=useState<string>(''); const [list,setList]=useState<Child[]>([])
  const [name,setName]=useState(''); const [emoji,setEmoji]=useState('👶'); const [pin,setPin]=useState('')
  const [msg,setMsg]=useState<string| null>(null)

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.auth.getUser(); const uid = data.user?.id || ''
    setUserId(uid); if (!uid) return
    const { data:rows } = await supabase.from('children').select('*').eq('parent_id', uid).order('name')
    setList(rows || [])
  })() },[])

  const add = async (e:React.FormEvent) => {
    e.preventDefault(); setMsg(null)
    if (!userId || !name || !pin) { setMsg('Champs requis manquants.'); return }
    
    // Hash the PIN (simple hash for demo - in production use proper hashing)
    const pinHash = btoa(pin) // Simple base64 encoding for demo
    
    const { error } = await supabase.from('children').insert({
      parent_id: userId, 
      name: name, 
      emoji: emoji,
      pin_hash: pinHash
    })
    if (error) { setMsg(error.message); return }
    const { data:rows } = await supabase.from('children').select('*').eq('parent_id', userId).order('name')
    setList(rows || []); setName(''); setEmoji('👶'); setPin(''); setMsg('Enfant ajouté.')
  }

  const del = async (id:string) => {
    await supabase.from('children').delete().eq('id', id)
    setList(list.filter(x=>x.id!==id))
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Gérer les enfants</h1>
      {msg && <div className="p-3 bg-yellow-50 border border-yellow-200 text-sm">{msg}</div>}
      <form onSubmit={add} className="space-y-2">
        <input className="w-full border px-3 py-2 rounded" placeholder="Prénom/Pseudo" value={name} onChange={e=>setName(e.target.value)} />
        <div className="flex gap-2">
          <select className="border px-3 py-2 rounded" value={emoji} onChange={e=>setEmoji(e.target.value)}>
            <option value="👶">👶 Bébé</option>
            <option value="🧒">🧒 Enfant</option>
            <option value="👦">👦 Garçon</option>
            <option value="👧">👧 Fille</option>
            <option value="🐻">🐻 Ourson</option>
            <option value="🦁">🦁 Lion</option>
            <option value="🐸">🐸 Grenouille</option>
            <option value="🦄">🦄 Licorne</option>
          </select>
        </div>
        <input className="w-full border px-3 py-2 rounded" placeholder="PIN (4 chiffres)" value={pin} onChange={e=>setPin(e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded">Ajouter</button>
      </form>

      <ul className="divide-y border rounded">
        {list.map(c=>(
          <li key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.emoji} {c.name}</div>
              <div className="text-sm text-gray-500">Créé le {new Date(c.created_at).toLocaleDateString()}</div>
            </div>
            <button onClick={()=>del(c.id)} className="text-sm underline">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  )
}