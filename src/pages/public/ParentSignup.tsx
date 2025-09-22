import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface ParentSignupProps {
  onSubmit?: (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    birthdate: string
  }) => Promise<void>
}

export default function ParentSignup({ onSubmit }: ParentSignupProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    birthDate: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)

    try {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.birthDate || !acceptTerms) {
        setErr('Merci de remplir tous les champs et d\'accepter les CGU.')
        return
      }

      const signupData = formData

      if (onSubmit) {
        await onSubmit(signupData)
      } else {
        // Use AuthContext
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        )

        if (error) {
          if (error.message.includes('rate limit')) {
            setErr('Trop de tentatives. Veuillez attendre quelques minutes avant de réessayer.')
          } else if (error.message.includes('already registered')) {
            setErr('Cette adresse email est déjà utilisée.')
          } else {
            setErr(`Erreur d'inscription: ${error.message}`)
          }
          return
        }

        setMsg('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          birthDate: ''
        })
        setAcceptTerms(false)
      }
    } catch (error: any) {
      setErr(error.message || 'Erreur de connexion. Vérifiez votre connexion internet.')
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
            <Link to="/parent/login" className="nav-link px-4 py-2 text-text-secondary hover:text-text-primary font-medium">
              Se connecter
            </Link>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md animate-scale-in">
          <div className="bento-card glass-effect">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-text-primary mb-2">
                Créer un compte parent
              </h1>
            </div>

            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{err}</p>
              </div>
            )}
            
            {msg && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm">{msg}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-text-primary mb-2">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Votre prénom"
                    className="input w-full transition-all duration-300 focus:scale-105"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-text-primary mb-2">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Votre nom"
                    className="input w-full transition-all duration-300 focus:scale-105"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  className="input w-full transition-all duration-300 focus:scale-105"
                  required
                  disabled={loading}
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 8 caractères"
                    className="input w-full pr-10 transition-all duration-300 focus:scale-105"
                    required
                    disabled={loading}
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

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-text-primary mb-2">
                  Date de naissance
                </label>
                <div className="relative">
                  <input
                    type="date"
                    id="birthDate"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className="input w-full pr-10 transition-all duration-300 focus:scale-105"
                    required
                    disabled={loading}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  required
                  disabled={loading}
                />
                <label htmlFor="acceptTerms" className="text-sm text-text-secondary">
                  J'accepte les{' '}
                  <a href="#" className="text-primary hover:underline">
                    CGU
                  </a>
                  {' '}et{' '}
                  <a href="#" className="text-primary hover:underline">
                    CGV
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={!acceptTerms || loading}
                className="btn-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Création...' : 'Créer mon compte'}
                {!loading && <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>}
              </button>

              <p className="text-center text-sm text-text-secondary">
                Vous pourrez vous connecter immédiatement
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}