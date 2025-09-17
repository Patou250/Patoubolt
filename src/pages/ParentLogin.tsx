import { useState } from 'react'

export default function ParentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: call Supabase to create parent account with email/password/birthdate
  }

  return (
    <div className="max-w-md mx-auto mt-12 p-6 border rounded-lg">
      <h1 className="text-xl font-bold mb-4">Connexion parent</h1>
      <form onSubmit={signup} className="space-y-3">
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border px-3 py-2 rounded"/>
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full border px-3 py-2 rounded"/>
        <input type="date" value={birthdate} onChange={e => setBirthdate(e.target.value)} className="w-full border px-3 py-2 rounded"/>
        <button className="w-full bg-black text-white py-2 rounded">Créer mon compte</button>
      </form>
      <div className="mt-6 text-center">
        <button
          onClick={() => window.location.assign('/.netlify/functions/spotify-auth-start')}
          className="inline-block px-5 py-3 rounded-lg bg-green-600 text-white font-medium"
        >
          Se connecter avec Spotify
        </button>
      </div>
    </div>
  )
}