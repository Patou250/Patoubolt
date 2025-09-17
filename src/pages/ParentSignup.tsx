import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md lg:max-w-lg">
          <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <div className="text-4xl mb-4">✨</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer un compte</h1>
                <p className="text-gray-600">Rejoignez la communauté Patou</p>
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
              
              <form onSubmit={signup} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                      placeholder="Jean" 
                      value={firstName} 
                      onChange={e => setFirstName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input 
                      className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                      placeholder="Dupont" 
                      value={lastName} 
                      onChange={e => setLastName(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse email
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
                    type="email" 
                    placeholder="jean.dupont@email.com" 
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
                    minLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-3 focus:border-primary focus:ring-2 focus:ring-primary-200 outline-none transition-all" 
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
                    J'accepte les{' '}
                    <Link to="/cgu" className="text-primary hover:text-primary-700 transition-colors">
                      Conditions Générales d'Utilisation
                    </Link>
                    {' '}et la{' '}
                    <Link to="/privacy" className="text-primary hover:text-primary-700 transition-colors">
                      Politique de Confidentialité
                    </Link>
                  </label>
                </div>
                
                <button 
                  type="submit"
                  className="w-full bg-primary hover:bg-primary-600 disabled:bg-gray-400 text-white font-semibold rounded-lg py-2 transition-colors disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block mr-2"></div>
                      Création en cours...
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Déjà un compte ?{' '}
                  <Link to="/parent/login" className="text-primary font-semibold hover:text-primary-700 transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
        </div>
    </div>
  )
}