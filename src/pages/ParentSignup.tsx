import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentSignup() {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [accept, setAccept] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const signup = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)

    if (!firstName || !lastName || !email || !password || !birthdate || !accept) {
      setErr('Merci de remplir tous les champs et d\'accepter les CGU.')
      setLoading(false)
      return
    }

    try {
      console.log('🔄 Tentative d\'inscription...')
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: `${firstName} ${lastName}`,
            first_name: firstName,
            last_name: lastName,
            birthdate: birthdate
          }
        }
      })

      console.log('📝 Réponse Supabase:', { data, error })

      if (error) {
        console.error('❌ Erreur inscription:', error)
        
        if (error.message.includes('rate limit')) {
          setErr('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.')
        } else if (error.message.includes('already registered')) {
          setErr('Cette adresse email est déjà utilisée.')
        } else {
          setErr(`Erreur d'inscription: ${error.message}`)
        }
        return
      }

      if (data.user) {
        setMsg('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        
        // Reset form
        setFirstName('')
        setLastName('')
        setEmail('')
        setPassword('')
        setBirthdate('')
        setAccept(false)
      } else {
        setErr('Erreur inattendue lors de l\'inscription.')
      }

    } catch (error: any) {
      console.error('❌ Erreur catch:', error)
      setErr('Erreur de connexion. Vérifiez votre connexion internet.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Créer un compte parent</h1>
      
      {err && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 text-sm text-red-700 rounded">
          {err}
        </div>
      )}
      
      {msg && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 text-sm text-green-700 rounded">
          {msg}
        </div>
      )}
      
      <form onSubmit={signup} className="space-y-3">
        <input 
          className="w-full border rounded px-3 py-2" 
          placeholder="Prénom" 
          value={firstName} 
          onChange={e => setFirstName(e.target.value)}
          disabled={loading}
        />
        <input 
          className="w-full border rounded px-3 py-2" 
          placeholder="Nom" 
          value={lastName} 
          onChange={e => setLastName(e.target.value)}
          disabled={loading}
        />
        <input 
          className="w-full border rounded px-3 py-2" 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={e => setEmail(e.target.value)}
          disabled={loading}
        />
        <input 
          className="w-full border rounded px-3 py-2" 
          type="password" 
          placeholder="Mot de passe (min. 6 caractères)" 
          value={password} 
          onChange={e => setPassword(e.target.value)}
          disabled={loading}
          minLength={6}
        />
        <input 
          className="w-full border rounded px-3 py-2" 
          type="date" 
          value={birthdate} 
          onChange={e => setBirthdate(e.target.value)}
          disabled={loading}
        />
        <label className="text-sm flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={accept} 
            onChange={e => setAccept(e.target.checked)}
            disabled={loading}
          />
          J'accepte les CGV/CGU
        </label>
        <button 
          className="w-full bg-black text-white rounded py-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Création en cours...' : 'Créer mon compte'}
        </button>
      </form>
      
      <div className="mt-4 text-sm text-center">
        Déjà un compte ? <Link to="/parent/login" className="underline text-blue-600">Se connecter</Link>
      </div>
    </div>
  )
}