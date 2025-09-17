import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentLogin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const nav = useNavigate()

  const login = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(null)
    
    if (!email.trim() || !password.trim()) {
      setErr('Veuillez saisir votre email et mot de passe')
      nav('/parent/dashboard')
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); return }
    nav('/parent/dashboard')
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Connexion parent</h1>
      {err && <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm">{err}</div>}
      <form onSubmit={login} className="space-y-3">
        <input className="w-full border rounded px-3 py-2" type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="w-full bg-black text-white rounded py-2">Se connecter</button>
      </form>
      <div className="mt-4 text-sm">
        Pas de compte ? <Link to="/parent/signup" className="underline">Créer un compte</Link>
      </div>
    </div>
  )
}