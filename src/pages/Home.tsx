import { Link } from 'react-router-dom'
import { Shield, Share2, Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <img 
            src="/Patou emeraude sans fond.png" 
            alt="Patou Logo" 
            className="h-24 max-h-24 w-auto"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 text-center mt-6">
            Musique sécurisée pour toute la famille
          </h1>
          <p className="text-lg text-gray-700 text-center mt-4 max-w-2xl mx-auto">
            Patou offre un environnement musical adapté aux enfants, avec contrôle parental avancé et contenus vérifiés.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              to="/parent/signup"
              className="bg-primary text-white px-6 py-3 rounded-lg shadow-lg hover:bg-primary/90 font-semibold transition-colors"
            >
              Créer un compte gratuit
            </Link>
            <Link
              to="/child/login"
              className="bg-protect text-white px-6 py-3 rounded-lg hover:bg-protect/90 ml-0 sm:ml-4 font-semibold transition-colors"
            >
              Espace enfant
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
          {/* Card 1: Protéger */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-protect/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-protect" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Protéger</h3>
            <p className="text-gray-700">
              Sécurité et confiance grâce à des contenus filtrés
            </p>
          </div>

          {/* Card 2: Partager */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-share/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Share2 className="w-8 h-8 text-share" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Partager</h3>
            <p className="text-gray-700">
              Un lien musical entre parents et enfants
            </p>
          </div>

          {/* Card 3: Éveiller */}
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-16 h-16 bg-awaken/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-awaken" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Éveiller</h3>
            <p className="text-gray-700">
              Énergie et découvertes musicales adaptées
            </p>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Éveiller</h3>
          <p className="text-gray-700">
            Énergie et découvertes musicales adaptées
          </p>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Protéger */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-protect-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-protect" />
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-protect-100 text-protect-800 rounded-full text-sm font-medium mb-3">
                Protéger
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité garantie</h3>
              <p className="text-gray-700 leading-relaxed">
                Contenus vérifiés et adaptés à l'âge de vos enfants. Contrôle parental complet pour une écoute sereine.
              </p>
            </div>

            {/* Partager */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-share-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-share" />
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-share-100 text-share-800 rounded-full text-sm font-medium mb-3">
                Partager
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Moments en famille</h3>
              <p className="text-gray-700 leading-relaxed">
                Créez des playlists communes et partagez vos découvertes musicales en famille.
              </p>
            </div>

            {/* Éveiller */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 text-center">
              <div className="w-16 h-16 bg-awaken-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-awaken-600" />
              </div>
              <div className="inline-flex items-center px-3 py-1 bg-awaken-100 text-awaken-800 rounded-full text-sm font-medium mb-3">
                Éveiller
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Découverte musicale</h3>
              <p className="text-gray-700 leading-relaxed">
                Énergie et découvertes musicales adaptées
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call-to-Action Section */}
      <div className="max-w-5xl mx-auto mt-16 px-4">
        <div className="bg-gradient-to-r from-primary to-protect text-white py-12 px-6 text-center rounded-lg max-w-3xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">
            Prêt à commencer l'aventure musicale ?
          </h2>
          <Link
            to="/parent/signup"
            className="inline-block bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
          >
            Créer mon compte
          </Link>
        </div>
      </div>
    </div>
  )
}
  )
}