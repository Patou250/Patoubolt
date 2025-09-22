import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Child {
  id: string
  name: string
  emoji: string
  parent_id: string
  created_at: string
}

export default function ParentChildren() {
  const [children, setChildren] = useState<Child[]>([])
  const [userId, setUserId] = useState<string>('')
  const [formData, setFormData] = useState({
    name: '',
    emoji: '👶',
    pin: ''
  })
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        const sessionRaw = localStorage.getItem('patou_parent_session')
        if (!sessionRaw) {
          navigate('/parent/login')
          return
        }
        const session = JSON.parse(sessionRaw)
        setUserId(session.parent.id)
        await loadChildren(session.parent.id)
      } else {
        setUserId(user.id)
        await loadChildren(user.id)
      }
    } catch (error) {
      console.error('❌ Error loading data:', error)
      navigate('/parent/login')
    }
  }

  const loadChildren = async (parentId: string) => {
    try {
      console.log('👶 Loading children for:', parentId)
      
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .eq('parent_id', parentId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('❌ Error loading children:', error)
        return
      }

      console.log('✅ Children loaded:', data?.length || 0)
      setChildren(data || [])
    } catch (error) {
      console.error('❌ Failed to load children:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('📝 Creating child:', formData.name)
    
    setMessage(null)
    setLoading(true)

    try {
      if (!userId || !formData.name.trim() || !formData.pin.trim()) {
        setMessage('Veuillez remplir tous les champs.')
        return
      }

      if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
        setMessage('Le PIN doit contenir exactement 4 chiffres.')
        return
      }

      // Check if child with this name already exists
      const { data: existingChild } = await supabase
        .from('children')
        .select('id')
        .eq('parent_id', userId)
        .eq('name', formData.name.trim())
        .maybeSingle()

      if (existingChild) {
        setMessage('Un enfant avec ce nom existe déjà.')
        return
      }

      const pinHash = btoa(formData.pin)

      const { data, error } = await supabase
        .from('children')
        .insert({
          parent_id: userId,
          name: formData.name.trim(),
          emoji: formData.emoji,
          pin_hash: pinHash
        })
        .select()

      if (error) {
        console.error('❌ Error creating child:', error)
        setMessage(`Erreur: ${error.message}`)
        return
      }

      console.log('✅ Child created:', data)
      setMessage('✅ Enfant ajouté avec succès!')
      
      // Reset form
      setFormData({ name: '', emoji: '👶', pin: '' })
      
      // Reload children
      await loadChildren(userId)
    } catch (error) {
      console.error('❌ Unexpected error:', error)
      setMessage('Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteChild = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enfant ?')) return

    try {
      console.log('🗑️ Deleting child:', id)
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting:', error)
        setMessage(`Erreur: ${error.message}`)
        return
      }

      console.log('✅ Child deleted')
      setChildren(children.filter(c => c.id !== id))
      setMessage('Enfant supprimé')
    } catch (error) {
      console.error('❌ Delete error:', error)
      setMessage('Erreur lors de la suppression')
    }
  }

  const handleBack = () => {
    console.log('🔙 Back to dashboard')
    navigate('/parent/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      {/* Header */}
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
            <span className="text-xl font-bold text-gray-800">Gérer les enfants</span>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.includes('✅') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-yellow-50 border border-yellow-200 text-yellow-700'
          }`}>
            {message}
          </div>
        )}

        {/* Add Child Form */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Ajouter un enfant</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Prénom / Pseudo
              </label>
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Emma, Lucas..."
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Avatar
              </label>
              <select 
                value={formData.emoji}
                onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
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
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code PIN (4 chiffres)
              </label>
              <input 
                type="password"
                value={formData.pin}
                onChange={(e) => setFormData({...formData, pin: e.target.value})}
                placeholder="1234"
                maxLength={4}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none transition-all bg-white/80"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">
                L'enfant utilisera ce code pour se connecter
              </p>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Création...' : '+ Ajouter l\'enfant'}
            </button>
          </form>
        </div>

        {/* Children List */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Enfants configurés ({children.length})
            </h2>
          </div>

          {children.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Aucun enfant configuré</h3>
              <p className="text-gray-600">
                Utilisez le formulaire ci-dessus pour ajouter votre premier enfant
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {children.map(child => (
                <div key={child.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{child.emoji}</div>
                    <div>
                      <h3 className="font-bold text-gray-900">{child.name}</h3>
                      <p className="text-sm text-gray-600">
                        Créé le {new Date(child.created_at).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleDeleteChild(child.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    🗑️ Supprimer
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