import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music, CheckCircle, AlertCircle } from 'lucide-react'
import { setSpotifyTokens } from '../utils/spotify-tokens'
import { supabase } from '../lib/supabase'
import styles from './ParentCallback.module.css'

export default function ParentCallback() {
  const [status, setStatus] = useState('Traitement de l\'authentification...')
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    handleCallback()
  }, [])

  const handleCallback = async () => {
    try {
      console.log('🔄 Début du traitement du callback...')
      
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const state = urlParams.get('state')
      const error = urlParams.get('error')

      if (error) {
        console.error('❌ Erreur OAuth:', error)
        setError('Autorisation refusée par Spotify')
        return
      }

      if (!code) {
        console.error('❌ Code manquant')
        setError('Code d\'autorisation manquant')
        return
      }

      // Vérifier le state
      const storedState = localStorage.getItem('spotify_auth_state')
      if (state !== storedState) {
        console.error('❌ State invalide')
        setError('État de sécurité invalide')
        return
      }

      console.log('✅ Paramètres OAuth valides')
      localStorage.removeItem('spotify_auth_state')

      setStatus('Échange des tokens avec Spotify...')

      // Échanger le code contre des tokens
      const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: import.meta.env.VITE_REDIRECT_URI,
          client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          client_secret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
        })
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text()
        console.error('❌ Erreur tokens Spotify:', errorData)
        throw new Error('Échec de l\'échange de tokens')
      }

      const tokens = await tokenResponse.json()
      console.log('✅ Tokens reçus')

      // Sauvegarder les tokens
      setSpotifyTokens(tokens)

      setStatus('Récupération du profil utilisateur...')

      // Récupérer le profil utilisateur directement
      const userResponse = await fetch('https://api.spotify.com/v1/me', {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      })

      if (!userResponse.ok) {
        throw new Error('Impossible de récupérer le profil utilisateur')
      }

      const userProfile = await userResponse.json()
      console.log('✅ Profil utilisateur récupéré:', userProfile.email)

      setStatus('Création du profil parent...')

      // Créer ou mettre à jour le parent dans Supabase
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .upsert({
          email: userProfile.email,
          spotify_id: userProfile.id,
          refresh_token: tokens.refresh_token,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'spotify_id'
        })
        .select()
        .single()

      if (parentError) {
        console.error('❌ Erreur création parent:', parentError)
        throw new Error('Impossible de créer le profil parent')
      }

      console.log('✅ Parent créé/mis à jour:', parent.id)

      // Créer la session parent simple
      const parentSession = {
        parent: {
          id: parent.id,
          email: parent.email,
          spotify_id: parent.spotify_id
        },
        timestamp: Date.now()
      }

      localStorage.setItem('patou_parent_session', JSON.stringify(parentSession))
      console.log('✅ Session parent créée')

      setStatus('Connexion réussie !')
      setIsSuccess(true)

      // Rediriger vers le dashboard
      setTimeout(() => {
        navigate('/parent/dashboard')
      }, 2000)

    } catch (error) {
      console.error('❌ Erreur callback:', error)
      setError(error instanceof Error ? error.message : 'Erreur inconnue')
    }
  }

  return (
    <div className={styles.callback}>
      <div className="container">
        <div className={styles.callback__content}>
          <div className={styles.callback__icon}>
            {isSuccess ? (
              <CheckCircle className={styles.callback__iconSvg} />
            ) : error ? (
              <AlertCircle className={styles.callback__iconSvg} />
            ) : (
              <img 
                src="/Patou emeraude sans fond.png" 
                alt="Patou Logo" 
                className="w-6 h-6"
              />
            )}
          </div>
          
          <h1 className={styles.callback__title}>Patou</h1>
          
          {error ? (
            <div className="space-y-4">
              <p className={styles.callback__status} style={{ color: '#DC2626' }}>
                {error}
              </p>
              <button
                onClick={() => navigate('/parent/login')}
                className="btn btn--primary"
              >
                Réessayer
              </button>
            </div>
          ) : (
            <>
              <p className={styles.callback__status}>
                {status}
              </p>
              
              {!isSuccess && (
                <div className={styles.callback__spinner}></div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}