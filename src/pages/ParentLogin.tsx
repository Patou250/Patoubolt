import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    
    if (!email.trim() || !password.trim()) {
      setErr('Veuillez saisir votre email et mot de passe')
      setLoading(false)
      return
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { 
      setErr(error.message)
      setLoading(false)
      return 
    }
    navigate('/dashboard-parent')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo */}
        <div className="text-center mb-8">
          <img src="/patou-logo.svg" alt="Patou" className="h-12 mx-auto mb-6" />
          <div className="flex items-center justify-center gap-4 mb-6">
            <Link 
              to="/login-parent"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium"
            >
              Se connecter
            </Link>
            <Link 
              to="/signup-parent"
              className="px-4 py-2 bg-primary text-white rounded-full font-medium"
            >
              Créer un compte
            </Link>
          </div>
        </div>

        {/* Formulaire de connexion */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Connexion parent
          </h1>
          
          {err && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{err}</p>
            </div>
          )}
          
          <form onSubmit={login} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                type="password" 
                placeholder="Votre mot de passe" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                disabled={loading}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              {loading ? 'Connexion...' : 'Connexion...'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/signup-parent" 
              className="text-primary font-medium hover:text-primary-700 transition-colors"
            >
              Pas encore de compte ? Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}