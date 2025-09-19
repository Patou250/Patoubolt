import { Link } from 'react-router-dom'
import { Shield, Share2, Sparkles, ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50">
      {/* Hero Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center">
          <img 
            src="/Patou emeraude sans fond.png" 
            alt="Patou Logo" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Musique sécurisée pour toute la famille
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-8 leading-relaxed">
            Patou offre un environnement musical adapté aux enfants, avec contrôle parental avancé et contenus vérifiés.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/parent/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary-600 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Créer un compte
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/child/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 border border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-all transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
            >
              Espace enfant
            </Link>
          </div>
        </div>
      </section>

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
                Playlists éducatives et découvertes adaptées pour développer la curiosité musicale.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}