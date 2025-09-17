import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ParentSignup() {
  const [firstName,setFirstName]=useState(''); const [lastName,setLastName]=useState('')
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('')
  const [birthdate,setBirthdate]=useState(''); const [accept,setAccept]=useState(false)
  const [msg,setMsg]=useState<string| null>(null); const [err,setErr]=useState<string| null>(null)

  const signup = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(null); setMsg(null)
    if (!firstName || !lastName || !email || !password || !birthdate || !accept) {
      setErr('Merci de remplir tous les champs et d\'accepter les CGU.'); return
    }
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { first_name:firstName, last_name:lastName, birthdate },
        emailRedirectTo: 'https://patou.app/parent/login'
      }
    })
    if (error) { setErr(error.message); return }
    setMsg('📧 Un email de confirmation vous a été envoyé. Veuillez valider puis vous connecter.')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Créer un compte parent</h1>
      {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm">{err}</div>}
      {msg && <div className="mb-3 p-3 bg-green-50 border border-green-200 text-sm">{msg}</div>}
      <form onSubmit={signup} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" placeholder="Prénom" value={firstName} onChange={e=>setFirstName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Nom" value={lastName} onChange={e=>setLastName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="date" value={birthdate} onChange={e=>setBirthdate(e.target.value)} />
        <label className="text-sm flex items-center gap-2">
          <input type="checkbox" checked={accept} onChange={e=>setAccept(e.target.checked)} />
          J'accepte les CGV/CGU
        </label>
        <button className="w-full bg-black text-white rounded py-2">Créer mon compte</button>
      </form>
    </div>
  )
}