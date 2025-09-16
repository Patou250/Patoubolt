import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function ParentLogin() {
  const [mode, setMode] = useState<'login'|'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null); setLoading(true)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
      }
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
      nav('/parent/callback?next=connect-spotify')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSpotifyLogin = () => {
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
    <div className="min-h-screen bg-gradient-to-br from-patou-main-50 to-protect-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <img 
            src="/Patou emeraude sans fond.png" 
            alt="Patou Logo" 
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Compte parent</h1>
          <p className="text-gray-600">Gérez l'écoute musicale de vos enfants</p>
        </div>

        <form onSubmit={submit} className="space-y-4 mb-6">
          <input 
            className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-patou-main focus:border-transparent"
            placeholder="Email" 
            type="email"
            value={email} 
            onChange={e=>setEmail(e.target.value)} 
            required
          />
          <input 
            className="w-full rounded-lg px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-patou-main focus:border-transparent"
            placeholder="Mot de passe" 
            type="password" 
            value={password} 
            onChange={e=>setPassword(e.target.value)} 
            required
          />
          {error && <p className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}
          <button 
            disabled={loading}
            className="w-full rounded-xl px-5 py-3 bg-patou-main text-white font-medium hover:bg-patou-main-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Chargement...' : (mode==='signup' ? 'Créer mon compte' : 'Se connecter')}
          </button>
        </form>

        <div className="text-center mb-6">
          <button 
            onClick={()=>setMode(mode==='signup'?'login':'signup')}
            className="text-patou-main hover:text-patou-main-600 underline text-sm"
          >
            {mode==='signup' ? 'Déjà un compte ? Se connecter' : 'Nouveau ? Créer un compte'}
          </button>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={handleSpotifyLogin}
            className="w-full inline-flex items-center justify-center gap-3 rounded-xl px-5 py-3 bg-[#1DB954] text-white font-semibold hover:bg-[#1ed760] transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>
            </svg>
            Se connecter avec Spotify
          </button>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Requiert un compte Spotify Premium pour la lecture intégrée.
          </p>
        </div>
      </div>
    </div>
  )
}