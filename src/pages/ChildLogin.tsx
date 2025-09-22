import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { ArrowLeft, LogIn } from 'lucide-react'

export default function ChildLogin() {
  const [name, setName] = useState('')
  const [pin, setPin] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const login = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(null)
    setLoading(true)

    try {
      if (!name.trim() || !pin.trim()) {
        setErr('Veuillez saisir le nom et le PIN')
        return
      }

      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setErr('Le PIN doit contenir exactement 4 chiffres')
        return
      }

      console.log('🔍 Tentative de connexion enfant:', { name: name.trim() })

      // Hash the PIN to match stored format
      const pinHash = btoa(pin)

      const { data, error } = await supabase
        .from('children')
        .select('id, name, emoji, pin_hash')
        .eq('name', name.trim())
        .eq('pin_hash', pinHash)
        .maybeSingle()

      console.log('📡 Réponse Supabase:', { data, error })

      if (error) {
        console.error('❌ Erreur Supabase:', error)
        setErr('Erreur de connexion à la base de données')
        return
      }

      if (!data) {
        setErr('Nom ou PIN incorrect')
        return
      }

      console.log('✅ Connexion enfant réussie:', data.name)
      
      // Create child session
      const childSession = {
        id: data.id,
        name: data.name,
        emoji: data.emoji
      }
      
      localStorage.setItem('patou_child_session', JSON.stringify(childSession))
      navigate('/child')
    } catch (error) {
      console.error('❌ Erreur inattendue:', error)
      setErr('Erreur inattendue lors de la connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md lg:max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Link 
            to="/" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow absolute left-4 top-4 lg:relative lg:left-0 lg:top-0"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">👶 Espace Enfant</h1>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🎵</div>
            <h2 className="text-xl font-semibold text-gray-800">Connexion</h2>
            <p className="text-gray-600 text-sm mt-2">
              Entre ton nom et ton code secret
            </p>
          </div>

          {err && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{err}</p>
            </div>
          )}

          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton prénom
              </label>
              <input 
                className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg focus:border-awaken focus:ring-2 focus:ring-awaken-200 outline-none transition-all" 
                placeholder="Emma, Lucas..." 
                value={name} 
                onChange={e => setName(e.target.value)}
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ton code secret
              </label>
              <input 
                className="w-full border border-gray-300 rounded-md px-3 py-3 text-lg text-center tracking-widest focus:border-awaken focus:ring-2 focus:ring-awaken-200 outline-none transition-all" 
                placeholder="••••" 
                type="password"
                value={pin} 
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                4 chiffres que tes parents t'ont donnés
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading || !name.trim() || !pin.trim()}
              className="w-full bg-awaken hover:bg-awaken-600 disabled:bg-gray-400 text-gray-900 font-semibold rounded-lg py-2 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full"></div>
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              Pas de compte ? Demande à tes parents de t'en créer un
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}