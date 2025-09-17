export default function Home() {
  const handleSpotifyAuth = () => {
    // Force complete page navigation to bypass React Router
    // Force a complete page navigation
    window.open('/.netlify/functions/spotify-auth-start', '_self')
  }

  return (
    <section className="mx-auto max-w-xl text-center">
      <img src="/patou-logo.svg" alt="Patou" className="h-20 w-20 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Musique familiale, en toute simplicité</h1>
      <p className="text-gray-600 mb-8">Bêta minimale — authentification Spotify requise pour le lecteur.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          className="inline-block px-5 py-3 rounded-lg bg-black text-white font-medium"
        >
          Se connecter avec Spotify (Parent)
        </button>
        <a href="/child/login" className="inline-block px-5 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium">
          Espace enfant
        </a>
      </div>
    </section>
  )
}