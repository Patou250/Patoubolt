export default function Home() {
  const handleSpotifyAuth = () => {
    console.log('🎯 Début de l\'authentification Spotify côté client')
    
    // Variables d'environnement du frontend (disponibles)
    const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID
    const redirectUri = import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/parent/callback`
    
    console.log('🔧 Configuration:', {
      hasClientId: !!clientId,
      clientId: clientId ? `${clientId.substring(0, 8)}...` : 'MISSING',
      redirectUri,
      origin: window.location.origin
    })
    
    if (!clientId) {
      console.error('❌ VITE_SPOTIFY_CLIENT_ID manquant')
      alert('Configuration Spotify manquante. Vérifiez les variables d\'environnement.')
      return
    }

    // Scopes Spotify
    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ')

    // Génération du state pour la sécurité
    const state = Math.random().toString(36).substring(7)
    console.log('🎲 State généré:', state)
    localStorage.setItem('spotify_auth_state', state)

    // Construction de l'URL d'autorisation Spotify
    const params = new URLSearchParams({
      client_id: clientId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      show_dialog: 'true',
      state: state
    })

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`
    console.log('🔗 URL d\'autorisation générée:', authUrl)
    console.log('🚀 Redirection vers Spotify...')
    
    // Redirection directe
    window.location.href = authUrl
  }

  return (
    <section className="mx-auto max-w-xl text-center">
      <img src="/patou-logo.svg" alt="Patou" className="h-20 w-20 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Musique familiale, en toute simplicité</h1>
      <p className="text-gray-600 mb-8">Bêta minimale — authentification Spotify requise pour le lecteur.</p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {/* Bouton principal - authentification côté client */}
        <button
          onClick={handleSpotifyAuth}
          className="inline-block px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
        >
          🎵 Se connecter avec Spotify (Parent)
        </button>
        
        <a href="/child/login" className="inline-block px-5 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition-colors">
          Espace enfant
        </a>
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Origin: {window.location.origin}</p>
        <p>Client ID: {import.meta.env.VITE_SPOTIFY_CLIENT_ID ? 'CONFIGURÉ' : 'MANQUANT'}</p>
        <p>Redirect URI: {import.meta.env.VITE_REDIRECT_URI || `${window.location.origin}/parent/callback`}</p>
        <p>Mode: Authentification côté client (sans fonctions Netlify)</p>
      </div>
    </section>
  )
}