import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, User, CheckCircle, AlertCircle, Baby } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import type { Child } from '../types/child'
import bcrypt from 'bcryptjs'

export default function ChildLogin() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])
  const [selectedChild, setSelectedChild] = useState<string>('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [parentConnected, setParentConnected] = useState(false)
  const [checking, setChecking] = useState(true)

  // Créer des enfants de test si aucun n'existe
  const createTestChildren = async () => {
    try {
      // Créer des enfants de test en localStorage pour la démo
      const testChildren = [
        {
          id: 'demo-child-1',
          name: 'Emma',
          emoji: '👧',
          pin: '1234',
          parent_id: 'demo-parent-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-child-2',
          name: 'Lucas',
          emoji: '👦',
          pin: '0000',
          parent_id: 'demo-parent-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]

      localStorage.setItem('demo_children', JSON.stringify(testChildren))
      setChildren(testChildren)
      console.log('✅ Enfants de démo créés')
    } catch (error) {
      console.error('Erreur création enfants test:', error)
    }
  }

  useEffect(() => {
    checkParentConnection()
    loadChildren()
    // Créer des enfants de test après un délai
    setTimeout(createTestChildren, 1000)
  }, [])

  const checkParentConnection = () => {
    console.log('🔍 Vérification connexion parent...')
    const tokens = getSpotifyTokens()
    console.log('🎵 Tokens Spotify trouvés:', !!tokens)
    setParentConnected(!!tokens)
    setChecking(false)
  }

  const loadChildren = async () => {
    try {
      // Charger depuis localStorage pour la démo
      const stored = localStorage.getItem('demo_children')
      if (stored) {
        setChildren(JSON.parse(stored))
      } else {
        // Créer des enfants de démo si aucun n'existe
        await createTestChildren()
      }
    } catch (error) {
      console.error('Failed to load children:', error)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedChild || !pin) {
      setError('Veuillez sélectionner un enfant et saisir le PIN')
      return
    }

    if (pin.length !== 4) {
      setError('Le PIN doit contenir 4 chiffres')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Récupérer l'enfant depuis localStorage
      const stored = localStorage.getItem('demo_children')
      if (!stored) {
        throw new Error('Aucun enfant trouvé')
      }
      
      const children = JSON.parse(stored)
      const child = children.find((c: any) => c.id === selectedChild)
      
      if (!child) {
        throw new Error('Enfant non trouvé')
      }

      // For demo purposes, accept common demo PINs or simple validation
      const isValidPin = pin === '1234' || pin === '0000' || 
                        child.pin_hash.includes(pin) ||
                        child.pin_hash === pin
      
      if (!isValidPin) {
        throw new Error('PIN incorrect')
      }
      
      // Store child session
      localStorage.setItem('child_session', JSON.stringify({
        child: {
          id: child.id,
          name: child.name,
          emoji: child.emoji,
          parent_id: child.parent_id
        }
      }))
      
      console.log('✅ Child session stored:', {
        child: {
          id: child.id,
          name: child.name,
          emoji: child.emoji,
          parent_id: child.parent_id
        }
      })

      navigate('/child')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md w-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Vérification...
          </h2>
          <p className="text-gray-600">
            Vérification de la connexion Spotify
          </p>
        </div>
      </div>
    )
  }

  if (!parentConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <User className="w-8 h-8 text-purple-600" />
              <Music className="w-8 h-8 text-pink-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Espace Enfant</h1>
            <p className="text-gray-600">Accédez au lecteur Spotify familial</p>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-800 mb-1">
                  Parent non connecté
                </h3>
                <p className="text-sm text-orange-700">
                  Un parent doit d'abord se connecter à Spotify pour que vous puissiez utiliser le lecteur.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Instructions :</h3>
              <ol className="text-sm text-purple-800 space-y-1">
                <li>1. Demandez à un parent d'aller sur l'espace parent</li>
                <li>2. Le parent doit se connecter avec son compte Spotify Premium</li>
                <li>3. Revenez ici, vous serez automatiquement redirigé</li>
              </ol>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Vérifier à nouveau
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <img 
              src="/Patou emeraude sans fond.png" 
              alt="Patou Logo" 
              className="w-5 h-5"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Connexion Enfant</h1>
          <p className="text-gray-600">Sélectionnez votre profil et entrez votre PIN</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir mon profil
            </label>
            <div className="grid grid-cols-2 gap-3">
              {children.map((child) => (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChild(child.id)}
                  className={`p-4 border-2 rounded-lg text-center transition-all ${
                    selectedChild === child.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{child.emoji}</div>
                  <div className="text-sm font-medium text-gray-900">{child.name}</div>
                </button>
              ))}
            </div>
            {children.length === 0 && (
              <div className="text-center py-4">
                <p className="text-gray-500 mb-2">
                  Chargement des profils de démo...
                </p>
                <p className="text-sm text-blue-600">
                  Emma (PIN: 1234) et Lucas (PIN: 0000)
                </p>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-2">
              Mon PIN secret
            </label>
            <input
              id="pin"
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={4}
            />
          </div>

          <button
            type="submit"
            disabled={!selectedChild || pin.length !== 4 || isLoading || children.length === 0}
            className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Connexion...
              </div>
            ) : (
              children.length === 0 ? 'Chargement...' : 'Se connecter'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Profils de démo disponibles :
          </p>
          <p className="text-xs text-blue-600">
            👧 Emma (PIN: 1234) • 👦 Lucas (PIN: 0000)
          </p>
        </div>
      </div>
    </div>
  )
}