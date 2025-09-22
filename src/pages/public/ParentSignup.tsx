import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthdate, setBirthdate] = useState('')
  const [accept, setAccept] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setMsg(null)
    setLoading(true)

    try {
      if (!firstName || !lastName || !email || !password || !birthdate || !accept) {
        setErr('Merci de remplir tous les champs et d\'accepter les CGU.')
        return
      }

      const signupData = { firstName, lastName, email, password, birthdate }

      if (onSubmit) {
        await onSubmit(signupData)
      } else {
        // Default Supabase auth
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

        if (data.user) {
          setMsg('✅ Compte créé avec succès ! Vous pouvez maintenant vous connecter.')
          
          // Reset form
          setFirstName('')
          setLastName('')
          setEmail('')
          setPassword('')
          setBirthdate('')
          setAccept(false)
          
          // Redirect to login after 2 seconds
          setTimeout(() => {
            navigate('/parent/login')
          }, 2000)
        } else {
          setErr('Erreur inattendue lors de l\'inscription.')
        }
      }
    } catch (error: any) {
      setErr(error.message || 'Erreur de connexion. Vérifiez votre connexion internet.')
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
          <Link 
            to="/parent/login"
            className="flex-1 text-center py-2 px-4 text-gray-600 font-medium hover:text-gray-900 transition-colors"
          >
            Se connecter
          </Link>
          <div className="flex-1 text-center py-2 px-4 bg-white text-gray-900 rounded-full font-medium shadow-sm">
            Créer un compte
          </div>
        </div>

        {/* Formulaire d'inscription */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
            Créer un compte parent
          </h1>
          
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
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
                  placeholder="Votre prénom" 
                  value={firstName} 
                  onChange={e => setFirstName(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
                  placeholder="Votre nom" 
                  value={lastName} 
                  onChange={e => setLastName(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
                type="email" 
                placeholder="votre@email.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
                type="password" 
                placeholder="Minimum 6 caractères" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                minLength={6}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de naissance
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition-all" 
                type="date" 
                value={birthdate} 
                onChange={e => setBirthdate(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex items-start gap-3">
              <input 
                type="checkbox" 
                id="accept-terms"
                checked={accept} 
                onChange={e => setAccept(e.target.checked)}
                disabled={loading}
                className="mt-1"
              />
              <label htmlFor="accept-terms" className="text-sm text-gray-600">
                J'accepte les CGU et CGV
              </label>
            </div>
            
            <button 
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-lg py-3 transition-colors disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Création du compte...' : 'Création du compte...'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-gray-500">
            Vous pourrez vous connecter immédiatement
          </div>
        </div>
      </div>
    </div>
  )
}