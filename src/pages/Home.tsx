export default function Home() {
  return (
    <section className="mx-auto max-w-xl text-center">
      <img src="/patou-logo.svg" alt="Patou" className="h-20 w-20 mx-auto mb-4" />
      <h1 className="text-2xl font-semibold mb-2">Musique familiale, en toute simplicité</h1>
      <p className="text-gray-600 mb-8">Bêta minimale — authentification Spotify requise pour le lecteur.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a href="/.netlify/functions/spotify-auth-start" className="inline-block px-5 py-3 rounded-lg bg-black text-white font-medium">
          Se connecter avec Spotify (Parent)
        </a>
        <a href="/child/login" className="inline-block px-5 py-3 rounded-lg border border-gray-300 text-gray-900 font-medium">
          Espace enfant
        </a>
      </div>
    </section>
  )
}