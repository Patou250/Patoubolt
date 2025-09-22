import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

interface ParentLoginProps {
  onSubmit?: (email: string, password: string) => Promise<void>
}

export default function ParentLogin({ onSubmit }: ParentLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)
    
    try {
      if (!email.trim() || !password.trim()) {
        setErr('Veuillez saisir votre email et mot de passe')
        return
      }
      
      if (onSubmit) {
        await onSubmit(email, password)
      } else {
        // Default Supabase auth
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { 
          setErr(error.message)
          return 
        }
        navigate('/parent/dashboard')
      }
    } catch (error: any) {
      setErr(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header avec logo centré */}
        <div className="text-center mb-8">
          <img src="/patou-logo.svg" alt="Patou Logo" className="h-12 mx-auto mb-8" />
        </div>

        {/* Onglets Se connecter / Créer un compte */}
        <div className="flex bg-gray-100 rounded-full p-1 mb-8">
          <div className="flex-1 text-center py-2 px-4 bg-white text-gray-900 rounded-full font-medium shadow-sm">
            Se connecter
          </div>
          <Link 
            to="/parent/signup"
            className="flex-1 text-center py-2 px-4 text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            Créer un compte
          </Link>
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
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
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
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
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
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg py-3 transition-colors"
            >
              {loading ? 'Connexion...' : 'Connexion...'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <Link 
              to="/parent/signup" 
              className="text-green-600 font-medium hover:text-green-700 transition-colors"
            >
              Pas encore de compte ? Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}