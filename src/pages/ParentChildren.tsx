import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit2, Trash2, Baby, ArrowLeft } from 'lucide-react'
import { getParentSession } from '../utils/auth'
import { getChildrenForParent } from '../utils/child-auth'
import { supabase } from '../lib/supabase'
import { hashPin } from '../utils/crypto'
import type { Child, CreateChildData } from '../types/child'
import styles from './ParentChildren.module.css'

const EMOJI_OPTIONS = ['👶', '🧒', '👧', '👦', '😊', '😄', '🤗', '🌟', '🎈', '🎨', '🎵', '🚀']

export default function ParentChildren() {
  const [children, setChildren] = useState<Child[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingChild, setEditingChild] = useState<Child | null>(null)
  const [formData, setFormData] = useState<CreateChildData>({
    name: '',
    emoji: '👶',
    pin: ''
  })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const session = getParentSession()
    if (!session) {
      navigate('/parent/login')
      return
    }

    loadChildren()
  }, [navigate])

  const loadChildren = async () => {
    try {
      const session = getParentSession()
      if (!session) return

      const childrenData = await getChildrenForParent(session.parent.id)
      setChildren(childrenData)
    } catch (error) {
      console.error('Failed to load children:', error)
      setError('Erreur lors du chargement des enfants')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Le nom est requis')
      return
    }

    if (formData.pin.length !== 4 || !/^\d{4}$/.test(formData.pin)) {
      setError('Le PIN doit contenir exactement 4 chiffres')
      return
    }

    try {
      const session = getParentSession()
      if (!session) return

      const pinHash = await hashPin(formData.pin)

      if (editingChild) {
        // Update existing child
        const { error } = await supabase
          .from('children')
          .update({
            name: formData.name.trim(),
            emoji: formData.emoji,
            pin_hash: pinHash,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingChild.id)

        if (error) throw error
      } else {
        // Create new child
        const { error } = await supabase
          .from('children')
          .insert({
            name: formData.name.trim(),
            emoji: formData.emoji,
            pin_hash: pinHash,
            parent_id: session.parent.id
          })

        if (error) throw error
      }

      await loadChildren()
      setShowForm(false)
      setEditingChild(null)
      setFormData({ name: '', emoji: '👶', pin: '' })
    } catch (error) {
      console.error('Failed to save child:', error)
      setError('Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (child: Child) => {
    setEditingChild(child)
    setFormData({
      name: child.name,
      emoji: child.emoji,
      pin: '' // Don't pre-fill PIN for security
    })
    setShowForm(true)
  }

  const handleDelete = async (child: Child) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le profil de ${child.name} ?`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('children')
        .delete()
        .eq('id', child.id)

      if (error) throw error

      await loadChildren()
    } catch (error) {
      console.error('Failed to delete child:', error)
      setError('Erreur lors de la suppression')
    }
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingChild(null)
    setFormData({ name: '', emoji: '👶', pin: '' })
    setError('')
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loading__spinner}></div>
      </div>
    )
  }

  return (
    <div className={styles.children}>
      <div className="container">
        <div className={styles.children__content}>
          {/* Header */}
          <div className={styles.children__header}>
            <button
              onClick={() => navigate('/parent/dashboard')}
              className="btn btn--outline"
            >
              <ArrowLeft className={styles.children__backIcon} />
              Retour
            </button>
            <div className={styles.children__title}>
              <h1>Profils Enfants</h1>
              <p>Gérez les profils de vos enfants</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn--primary"
            >
              <Plus className={styles.children__addIcon} />
              Ajouter un enfant
            </button>
          </div>

          {error && (
            <div className={styles.children__error}>
              {error}
            </div>
          )}

          {/* Form */}
          {showForm && (
            <div className={styles.children__form}>
              <h2>{editingChild ? 'Modifier' : 'Ajouter'} un enfant</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.form__group}>
                  <label htmlFor="name">Nom</label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de l'enfant"
                    maxLength={50}
                  />
                </div>

                <div className={styles.form__group}>
                  <label>Emoji</label>
                  <div className={styles.emoji__grid}>
                    {EMOJI_OPTIONS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setFormData({ ...formData, emoji })}
                        className={`${styles.emoji__option} ${
                          formData.emoji === emoji ? styles['emoji__option--selected'] : ''
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.form__group}>
                  <label htmlFor="pin">PIN (4 chiffres)</label>
                  <input
                    id="pin"
                    type="password"
                    value={formData.pin}
                    onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
                    placeholder="••••"
                    maxLength={4}
                    pattern="\d{4}"
                  />
                </div>

                <div className={styles.form__actions}>
                  <button type="button" onClick={cancelForm} className="btn btn--outline">
                    Annuler
                  </button>
                  <button type="submit" className="btn btn--primary">
                    {editingChild ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Children List */}
          <div className={styles.children__list}>
            {children.length === 0 ? (
              <div className={styles.children__empty}>
                <Baby className={styles.children__emptyIcon} />
                <h3>Aucun profil enfant</h3>
                <p>Ajoutez le premier profil de votre enfant pour commencer</p>
              </div>
            ) : (
              <div className={styles.children__grid}>
                {children.map((child) => (
                  <div key={child.id} className={styles.child__card}>
                    <div className={styles.child__avatar}>
                      {child.emoji}
                    </div>
                    <div className={styles.child__info}>
                      <h3>{child.name}</h3>
                      <p>Créé le {new Date(child.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className={styles.child__actions}>
                      <button
                        onClick={() => handleEdit(child)}
                        className={styles.child__action}
                        aria-label={`Modifier ${child.name}`}
                      >
                        <Edit2 className={styles.child__actionIcon} />
                      </button>
                      <button
                        onClick={() => navigate(`/parent/rules/${child.id}`)}
                        className={styles.child__action}
                        aria-label={`Règles pour ${child.name}`}
                      >
                        <Shield className={styles.child__actionIcon} />
                      </button>
                      <button
                        onClick={() => handleDelete(child)}
                        className={`${styles.child__action} ${styles['child__action--danger']}`}
                        aria-label={`Supprimer ${child.name}`}
                      >
                        <Trash2 className={styles.child__actionIcon} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}