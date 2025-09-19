import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentLogin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const login = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(null); setLoading(true)
    
    if (!email.trim() || !password.trim()) {
      setErr('Veuillez saisir votre email et mot de passe')
      setLoading(false)
      return
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); setLoading(false); return }
    nav('/parent/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Connexion Parent</h1>
                <p className="text-gray-600">Accédez à votre espace de gestion</p>
              </div>
              
              {err && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{err}</p>
                </div>
              )}
              
              <form onSubmit={login} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    disabled={loading}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={loading}
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold rounded-lg py-2 transition-colors"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link to="/parent/signup" className="text-primary font-semibold hover:text-primary-700 transition-colors">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
        </div>
    </div>
  )
}