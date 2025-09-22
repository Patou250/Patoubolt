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
        .select('id, name, emoji, pin_hash, parent_id')
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
        child: {
          id: data.id,
          name: data.name,
          emoji: data.emoji,
          parent_id: data.parent_id
        },
        timestamp: Date.now()
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
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50">
      {/* Header avec retour */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link 
              to="/" 
              className="flex items-center justify-center w-10 h-10 bg-white/80 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">👶 Espace Enfant</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] py-12">
        <div className="w-full max-w-md">
          {/* Formulaire de connexion */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4 animate-bounce">🎵</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Salut !</h2>
              <p className="text-gray-600">
                Entre ton nom et ton code secret pour écouter de la musique
              </p>
            </div>

            {err && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-700 text-sm">{err}</p>
              </div>
            )}

            <form onSubmit={login} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton prénom
                </label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-lg focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all bg-white/80" 
                  placeholder="Emma, Lucas..." 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton code secret
                </label>
                <input 
                  className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-2xl text-center tracking-widest focus:border-yellow-400 focus:ring-4 focus:ring-yellow-100 outline-none transition-all bg-white/80" 
                  placeholder="••••" 
                  type="password"
                  value={pin} 
                  onChange={e => setPin(e.target.value)}
                  maxLength={4}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  4 chiffres que tes parents t'ont donnés
                </p>
              </div>

              <button 
                type="submit"
                disabled={loading || !name.trim() || !pin.trim()}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:scale-100 disabled:shadow-none flex items-center justify-center gap-2 text-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-6 h-6 border-3 border-white border-t-transparent rounded-full"></div>
                    Connexion...
                  </>
                ) : (
                  <>
                    <LogIn className="w-6 h-6" />
                    Entrer dans Patou
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-xs text-gray-500">
                Pas de compte ? Demande à tes parents de t'en créer un
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}