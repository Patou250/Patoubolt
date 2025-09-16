import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Music } from 'lucide-react'
import { getParentSession } from '../utils/auth'
import { buildAuthUrl, clearTokens } from '../utils/spotify-auth'
import styles from './ParentLogin.module.css'

export default function ParentLogin() {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if already logged in
    const session = getParentSession()
    if (session) {
      navigate('/parent/dashboard')
    }
  }, [navigate])

  const handleSpotifyLogin = () => {
    console.log('🎯 CLIC DÉTECTÉ - Début handleSpotifyLogin')
    console.log('🔧 Variables d\'environnement au moment du clic:', {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
      currentUrl: window.location.href,
      origin: window.location.origin
    })
    
    console.log('🎯 CLIC DÉTECTÉ - Début handleSpotifyLogin')
    console.log('🔧 Variables d\'environnement au moment du clic:', {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      clientSecret: import.meta.env.VITE_SPOTIFY_CLIENT_SECRET,
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
      currentUrl: window.location.href,
      origin: window.location.origin
    })
    
    console.log('🚀 Début de la connexion Spotify...');
    console.log('🔧 Variables d\'environnement:', {
      clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
      redirectUri: import.meta.env.VITE_REDIRECT_URI,
      currentOrigin: window.location.origin
    });
    
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/parent/callback`;
    
    console.log('🔧 Configuration OAuth:', {
      hasClientId: !!clientId,
      redirectUri,
      origin: window.location.origin
    });
    
    if (!clientId) {
      console.error('❌ Client ID Spotify manquant');
      alert('Configuration Spotify manquante. Vérifiez les variables d\'environnement.');
      return;
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-public',
      'playlist-modify-private',
      'user-library-read',
      'user-library-modify',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ');

    const state = Math.random().toString(36).substring(7);
    console.log('🎲 State généré:', state);
    localStorage.setItem('spotify_auth_state', state);

    const authUrl = `https://accounts.spotify.com/authorize?` +
      `client_id=${clientId}&` +
      `response_type=code&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `show_dialog=true&` +
      `state=${state}`;

    console.log('🔗 URL d\'authentification générée:', authUrl);
    console.log('🌐 Redirection vers Spotify...');
    
    // Nettoyer les anciens tokens avant la nouvelle connexion
    console.log('🧹 Nettoyage des anciens tokens...');
    localStorage.removeItem('spotify_tokens');
    localStorage.removeItem('patou_parent_session');
    
    console.log('🚀 Redirection immédiate vers:', authUrl);
    
    // Test de localStorage avant redirection
    try {
      localStorage.setItem('test_storage', 'test')
      const testRead = localStorage.getItem('test_storage')
      console.log('🧪 Test localStorage:', testRead === 'test' ? 'OK' : 'ÉCHEC')
      localStorage.removeItem('test_storage')
    } catch (error) {
      console.error('❌ localStorage non disponible:', error)
      console.error('❌ Stack trace:', error.stack)
      alert('Erreur: localStorage non disponible. Vérifiez les paramètres de votre navigateur.')
      return
    }
    
    window.location.href = authUrl;
  };

  return (
    <div className={styles.login}>
      <div className="container">
        <div className={styles.login__content}>
          <div className={styles.login__hero}>
            <img 
              src="/Patou emeraude sans fond.png" 
              alt="Patou Logo" 
              className="h-10 w-auto mx-auto mb-6"
            />
            <h1 className={styles.login__title}>Espace Parent</h1>
            <p className={styles.login__subtitle}>
              Connectez-vous avec votre compte Spotify pour gérer l'écoute de vos enfants
            </p>
          </div>
          
          <div className={styles.login__actions}>
            <button
              onClick={handleSpotifyLogin}
              disabled={isLoading}
              className="btn btn--primary btn--large"
              aria-label="Se connecter avec Spotify"
            >
              {isLoading ? 'Connexion...' : 'Se connecter avec Spotify'}
            </button>
          </div>
          
          <div className={styles.login__info}>
            <p className={styles.login__infoText}>
              Un compte Spotify Premium est requis pour utiliser cette fonctionnalité
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}