import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function ParentLogin() {
  const [email, setEmail] = useState(''); const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const nav = useNavigate()

  const login = async (e:React.FormEvent) => {
    e.preventDefault(); setErr(null)
    
    if (!email.trim() || !password.trim()) {
      setErr('Veuillez saisir votre email et mot de passe')
      return
    }
    
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setErr(error.message); return }
    nav('/parent/dashboard')
  }

  return (
    <div className="patou-layout">
      <Header />
      
      <main className="patou-main">
        <div className="container">
          <div className="max-w-md mx-auto">
            <div className="patou-card">
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
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-patou-green focus:ring-2 focus:ring-patou-green-100 outline-none transition-all" 
                    type="email" 
                    placeholder="votre@email.com" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe
                  </label>
                  <input 
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-patou-green focus:ring-2 focus:ring-patou-green-100 outline-none transition-all" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                  />
                </div>
                
                <button type="submit" className="w-full btn btn--primary btn--large">
                  Se connecter
                </button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-gray-600">
                  Pas encore de compte ?{' '}
                  <Link to="/parent/signup" className="text-patou-green font-semibold hover:text-patou-green-600 transition-colors">
                    Créer un compte
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}