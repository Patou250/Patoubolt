import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔐 Parent login attempt:', email)
    
    setError(null)
    setLoading(true)
    
    try {
      if (!email.trim() || !password.trim()) {
        setError('Veuillez saisir votre email et mot de passe')
        return
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      })
      
      if (error) {
        console.error('❌ Login error:', error)
        setError('Email ou mot de passe incorrect')
        return
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.email)
        
        // Create parent session
        const parentSession = {
          parent: {
            id: data.user.id,
            email: data.user.email || email,
            spotify_id: data.user.id
          },
          timestamp: Date.now()
        }
        localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
        console.log('✅ Parent session created')
        
        navigate('/parent/dashboard')
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    console.log('🔙 Back to home')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header with back button */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="flex items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              ←
            </button>
            <img src="/patou-logo.svg" alt="Patou" className="h-8" />
            <span className="text-xl font-bold text-gray-800">Connexion Parent</span>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex bg-white/60 backdrop-blur-lg rounded-2xl p-1 mb-8 shadow-lg">
            <div className="flex-1 text-center py-3 px-4 bg-white text-gray-900 rounded-xl font-semibold shadow-sm">
              Se connecter
            </div>
            <Link 
              to="/parent/signup"
              className="flex-1 text-center py-3 px-4 text-gray-600 font-medium hover:text-gray-900 transition-colors rounded-xl"
            >
              Créer un compte
            </Link>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Connexion parent
              </h1>
              <p className="text-gray-600">
                Accédez à votre espace de contrôle parental
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Votre mot de passe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Connexion...
                  </div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link 
                to="/parent/signup" 
                className="text-emerald-600 font-semibold hover:text-emerald-700 transition-colors"
              >
                Pas encore de compte ? Créer un compte
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}