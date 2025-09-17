import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Child = { id:string; display_name:string; child_identifier:string; birthdate:string; pin:string }

export default function ParentChildren(){
  const [userId,setUserId]=useState<string>(''); const [list,setList]=useState<Child[]>([])
  const [name,setName]=useState(''); const [identifier,setIdentifier]=useState(''); const [birthdate,setBirthdate]=useState(''); const [pin,setPin]=useState('')
  const [msg,setMsg]=useState<string| null>(null)

  useEffect(()=>{ (async()=>{
    const { data } = await supabase.auth.getUser(); const uid = data.user?.id || ''
    setUserId(uid); if (!uid) return
    const { data:rows } = await supabase.from('children').select('*').eq('parent_id', uid).order('display_name')
    setList(rows || [])
  })() },[])

  const add = async (e:React.FormEvent) => {
    e.preventDefault(); setMsg(null)
    if (!userId || !name || !identifier || !pin) { setMsg('Champs requis manquants.'); return }
    const { data:exists } = await supabase.from('children').select('id').eq('child_identifier', identifier).maybeSingle()
    if (exists) { setMsg('Identifiant déjà utilisé.'); return }
    const { error } = await supabase.from('children').insert({
      parent_id: userId, display_name: name, child_identifier: identifier, birthdate, pin
    })
    if (error) { setMsg(error.message); return }
    const { data:rows } = await supabase.from('children').select('*').eq('parent_id', userId).order('display_name')
    setList(rows || []); setName(''); setIdentifier(''); setBirthdate(''); setPin(''); setMsg('Enfant ajouté.')
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
        <input className="w-full border px-3 py-2 rounded" placeholder="Identifiant unique (ex: leo2024)" value={identifier} onChange={e=>setIdentifier(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" type="date" value={birthdate} onChange={e=>setBirthdate(e.target.value)} />
        <input className="w-full border px-3 py-2 rounded" placeholder="PIN (4 chiffres)" value={pin} onChange={e=>setPin(e.target.value)} />
        <button className="px-4 py-2 bg-black text-white rounded">Ajouter</button>
      </form>

      <ul className="divide-y border rounded">
        {list.map(c=>(
          <li key={c.id} className="p-3 flex items-center justify-between">
            <div>
              <div className="font-medium">{c.display_name}</div>
              <div className="text-sm text-gray-500">{c.child_identifier} — PIN {c.pin}</div>
            </div>
            <button onClick={()=>del(c.id)} className="text-sm underline">Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  )
}