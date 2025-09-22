import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function ParentSignup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: ''
  })
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Parent signup attempt:', formData.email)
    
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.birthDate || !acceptTerms) {
        setError('Merci de remplir tous les champs et d\'accepter les CGU.')
        return
      }

      if (formData.password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          emailRedirectTo: undefined,
          data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            birthdate: formData.birthDate
          }
        }
      })

      if (error) {
        console.error('❌ Signup error:', error)
        if (error.message.includes('already registered')) {
          setError('Cette adresse email est déjà utilisée.')
        } else {
          setError(`Erreur d'inscription: ${error.message}`)
        }
        return
      }

      if (data.user) {
        console.log('✅ Signup successful:', data.user.email)
        setMessage('✅ Compte créé avec succès ! Connexion automatique...')
        
        // Auto-login
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        })
        
        if (!loginError) {
          // Create parent session
          const parentSession = {
            parent: {
              id: data.user.id,
              email: data.user.email || formData.email,
              spotify_id: data.user.id
            },
            timestamp: Date.now()
          }
          localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
          console.log('✅ Parent session created')
          
          setTimeout(() => {
            navigate('/parent/dashboard')
          }, 1500)
        }
      }
    } catch (error: any) {
      console.error('❌ Unexpected error:', error)
      setError('Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
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
            <span className="text-xl font-bold text-gray-800">Créer un compte</span>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          {/* Tabs */}
          <div className="flex bg-white/60 backdrop-blur-lg rounded-2xl p-1 mb-8 shadow-lg">
            <Link 
              to="/parent/login"
              className="flex-1 text-center py-3 px-4 text-gray-600 font-medium hover:text-gray-900 transition-colors rounded-xl"
            >
              Se connecter
            </Link>
            <div className="flex-1 text-center py-3 px-4 bg-white text-gray-900 rounded-xl font-semibold shadow-sm">
              Créer un compte
            </div>
          </div>

          {/* Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Créer un compte parent
              </h1>
              <p className="text-gray-600">
                Rejoignez Patou pour protéger vos enfants
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            {message && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 caractères"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de naissance
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={formData.birthDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                  required
                  disabled={loading}
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  required
                  disabled={loading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-600">
                  J'accepte les conditions générales et la politique de confidentialité
                </label>
              </div>

              <button
                type="submit"
                disabled={!acceptTerms || loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Création...
                  </div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}