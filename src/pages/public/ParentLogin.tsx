import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface ParentLoginProps {
  onSubmit?: (email: string, password: string) => Promise<void>
}

export default function ParentLogin({ onSubmit }: ParentLoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuth()

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
        // Use AuthContext
        const { error } = await signIn(email, password)
        if (error) {
          setErr(error.message || 'Erreur de connexion')
          return
        }
      }
    } catch (error: any) {
      setErr(error.message || 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-page">
      <header className="glass-effect sticky top-0 z-50 border-b border-gray-200/50 py-4">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img 
              src="/patou-logo.svg" 
              alt="Patou Logo" 
              className="h-8 w-auto transition-transform duration-300 hover:scale-110" 
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/parent/signup" className="nav-link px-4 py-2 text-text-secondary hover:text-text-primary font-medium">
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bento-card glass-effect">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Connexion parent
              </h1>
            </div>

            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{err}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <input 
                  type="email"
                  id="email"
                  placeholder="votre@email.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)} 
                  disabled={loading}
                  className="input w-full transition-all duration-300 focus:scale-105"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? "text" : "password"}
                    id="password"
                    placeholder="Votre mot de passe" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    disabled={loading}
                    className="input w-full pr-10 transition-all duration-300 focus:scale-105"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? 'Connexion...' : 'Se connecter'}
                {!loading && <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <Link 
                to="/parent/signup" 
                className="text-primary font-medium hover:text-primary-glow transition-colors"
              >
                Pas encore de compte ? Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full max-w-md">
        {/* Header avec logo centré */}
        <div className="text-center mb-8">
          <img src="/patou-logo.svg" alt="Patou Logo" className="h-12 w-auto mx-auto mb-8" />
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