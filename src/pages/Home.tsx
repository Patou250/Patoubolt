export default function Home() {
  const handleSpotifyAuth = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    console.log('🎯 Bouton Spotify cliqué - début de la fonction')
    
    // URL de la fonction Netlify
    const functionUrl = '/.netlify/functions/spotify-auth-start'
    const fullUrl = `${window.location.origin}${functionUrl}`
    
    console.log('🔗 URL construite:', fullUrl)
    console.log('🌐 Origin:', window.location.origin)
    console.log('🔧 Function path:', functionUrl)
    
    // Méthode 1: Ouvrir dans la même fenêtre avec window.open
    try {
      console.log('🚀 Tentative 1: window.open avec _self')
      const opened = window.open(fullUrl, '_self')
      console.log('✅ window.open résultat:', opened)
      
      // Si window.open a fonctionné, on s'arrête là
      if (opened) {
        console.log('✅ Navigation réussie avec window.open')
        return
      }
    } catch (error) {
      console.error('❌ Erreur window.open:', error)
    }
    
    // Méthode 2: Navigation directe
    try {
      console.log('🚀 Tentative 2: window.location.href')
      window.location.href = fullUrl
      console.log('✅ window.location.href exécuté')
    } catch (error) {
      console.error('❌ Erreur window.location.href:', error)
      
      // Méthode 3: Fallback ultime
      try {
        console.log('🚀 Tentative 3: document.location')
        document.location.href = fullUrl
        console.log('✅ document.location.href exécuté')
      } catch (error3) {
        console.error('❌ Toutes les méthodes ont échoué:', error3)
        alert('Impossible de rediriger vers Spotify. Veuillez réessayer.')
      }
    }
  }

  return (
    <section className="mx-auto max-w-xl text-center">
      <img src="/patou-logo.svg" alt="Patou" className="h-20 w-20 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Musique familiale, en toute simplicité</h1>
      <p className="text-gray-600 mb-8">Bêta minimale — authentification Spotify requise pour le lecteur.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {/* Bouton avec gestionnaire d'événement */}
        <button
          onClick={handleSpotifyAuth}
          className="inline-block px-5 py-3 rounded-lg bg-black text-white font-medium hover:bg-gray-800 transition-colors"
        >
          Se connecter avec Spotify (Parent)
        </button>
        
        {/* Lien direct alternatif */}
        <a 
          href="/.netlify/functions/spotify-auth-start"
          target="_self"
          className="inline-block px-5 py-3 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
        >
          🔗 Lien direct Spotify
        </a>
        
        <a href="/child/login" className="inline-block px-5 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium hover:bg-gray-50 transition-colors">
          Espace enfant
        </a>
      </div>
      
      {/* Debug info */}
      <div className="mt-8 p-4 bg-gray-100 rounded-lg text-left text-xs">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p>Origin: {window.location.origin}</p>
        <p>Pathname: {window.location.pathname}</p>
        <p>Function URL: /.netlify/functions/spotify-auth-start</p>
      </div>
    </section>
  )
}