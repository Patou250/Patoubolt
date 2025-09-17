import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'

type Child = { 
  id: string
  name: string
  pin_hash: string
  parent_id: string
  emoji: string
  created_at: string
  updated_at: string
}

export default function ParentChildren() {
  const [userId, setUserId] = useState<string>('')
  const [list, setList] = useState<Child[]>([])
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('👶')
  const [pin, setPin] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const uid = user?.id || ''
      setUserId(uid)
      
      if (!uid) {
        console.log('❌ No authenticated user')
        return
      }

      console.log('🔍 Loading children for user:', uid)
      
      // Try to load children using the existing schema
      const { data: rows, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', uid)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading children:', error)
        setMsg(`Erreur de chargement: ${error.message}`)
        return
      }

      console.log('✅ Children loaded:', rows?.length || 0)
      setList(rows || [])
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setMsg('Erreur inattendue lors du chargement')
    }
  }

  const add = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg(null)
    setLoading(true)

    try {
      if (!userId || !name.trim() || !pin.trim()) {
        setMsg('Veuillez remplir tous les champs.')
        return
      }

      if (pin.length !== 4 || !/^\d{4}$/.test(pin)) {
        setMsg('Le PIN doit contenir exactement 4 chiffres.')
        return
      }

      // Vérifier si un enfant avec ce nom existe déjà pour ce parent
      const { data: existingChild, error: checkError } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', userId)
        .eq('name', name.trim())
        .maybeSingle()

      if (checkError) {
        console.error('❌ Error checking existing child:', checkError)
        setMsg(`Erreur lors de la vérification: ${checkError.message}`)
        return
      }

      if (existingChild) {
        setMsg('Un enfant avec ce nom existe déjà.')
        return
      }

      console.log('🔄 Creating child:', { name, emoji, userId })

      // Simple hash for PIN (in production, use proper hashing)
      const pinHash = btoa(pin)

      const { data, error } = await supabase
        .from('children')
        .insert({
          parent_id: userId,
          name: name.trim(),
          emoji: emoji,
          pin_hash: pinHash
        })
        .select()

      if (error) {
        console.error('❌ Error creating child:', error)
        
        // Gestion spécifique des erreurs courantes
        if (error.code === '23505') {
          setMsg('Un enfant avec ce nom ou ce PIN existe déjà.')
        } else if (error.message.includes('duplicate')) {
          setMsg('Un enfant avec ces informations existe déjà.')
        } else {
          setMsg(`Erreur lors de la création: ${error.message}`)
        }
        return
      }

      console.log('✅ Child created:', data)
      setMsg('✅ Enfant ajouté avec succès!')
      
      // Reset form
      setName('')
      setEmoji('👶')
      setPin('')
      
      // Reload list
      await loadData()
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setMsg('Erreur inattendue lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const deleteChild = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) return

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting child:', error)
        setMsg(`Erreur lors de la suppression: ${error.message}`)
        return
      }

      setList(list.filter(x => x.id !== id))
      setMsg('Enfant supprimé')
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setMsg('Erreur lors de la suppression')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link 
            to="/parent/dashboard" 
            className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">👨‍👩‍👧‍👦 Gérer les enfants</h1>
        </div>

        {/* Message */}
        {msg && (
          <div className={`mb-6 p-4 rounded-lg ${
            msg.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            {msg}
          </div>
        )}

        {/* Add Child Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ajouter un enfant</h2>
          
          <form onSubmit={add} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom / Pseudo
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all" 
                placeholder="Ex: Emma, Lucas..." 
                value={name} 
                onChange={e => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Avatar
              </label>
              <select 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all" 
                value={emoji} 
                onChange={e => setEmoji(e.target.value)}
                disabled={loading}
              >
                <option value="👶">👶 Bébé</option>
                <option value="🧒">🧒 Enfant</option>
                <option value="👦">👦 Garçon</option>
                <option value="👧">👧 Fille</option>
                <option value="🐻">🐻 Ourson</option>
                <option value="🦁">🦁 Lion</option>
                <option value="🐸">🐸 Grenouille</option>
                <option value="🦄">🦄 Licorne</option>
                <option value="🐨">🐨 Koala</option>
                <option value="🐼">🐼 Panda</option>
                <option value="🦊">🦊 Renard</option>
                <option value="🐱">🐱 Chat</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code PIN (4 chiffres)
              </label>
              <input 
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-400 focus:ring-2 focus:ring-green-100 outline-none transition-all" 
                placeholder="1234" 
                value={pin} 
                onChange={e => setPin(e.target.value)}
                maxLength={4}
                pattern="\d{4}"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                L'enfant utilisera ce code pour se connecter
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Création...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Ajouter l'enfant
                </>
              )}
            </button>
          </form>
        </div>

        {/* Children List */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Enfants configurés ({list.length})
            </h2>
          </div>

          {list.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Aucun enfant configuré</h3>
              <p className="text-gray-600">
                Ajoutez le profil de votre premier enfant pour commencer
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {list.map(child => (
                <div key={child.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{child.emoji}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-500">
                        Créé le {new Date(child.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteChild(child.id)}
                    className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer cet enfant"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm">Supprimer</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}