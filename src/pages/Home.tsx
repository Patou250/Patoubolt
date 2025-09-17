import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { usePreviewGate } from '../hooks/usePreviewGate'
import PreviewGate from '../components/PreviewGate'
import Header from '../components/Header'
import Footer from '../components/Footer'

export default function Home() {
  const { mustGate } = usePreviewGate()

  // Afficher le gate de prévisualisation si nécessaire
  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <div className="patou-layout">
      <Header />
      
      <main className="patou-main">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="mb-16">
              <h1 className="text-5xl font-bold text-gray-900 mb-6">
                Bienvenue sur <span className="text-primary">Patou</span>
              </h1>
              <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
                La plateforme musicale sécurisée qui accompagne vos enfants dans la découverte de la musique, 
                avec des contenus adaptés et un contrôle parental avancé.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Link to="/parent/login" className="btn btn--primary btn--large">
                  👨‍👩‍👧‍👦 Espace Parent
                </Link>
                <Link to="/child/login" className="btn btn--secondary btn--large">
                  🎵 Espace Enfant
                </Link>
              </div>
            </div>
            
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="patou-card text-center">
                <div className="text-4xl mb-4">🛡️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Sécurisé</h3>
                <p className="text-gray-600">
                  Contenus filtrés et adaptés à l'âge de vos enfants pour une écoute en toute sérénité.
                </p>
              </div>
              
              <div className="patou-card text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Personnalisé</h3>
                <p className="text-gray-600">
                  Playlists adaptées aux goûts et à l'âge de chaque enfant, avec des découvertes musicales enrichissantes.
                </p>
              </div>
              
              <div className="patou-card text-center">
                <div className="text-4xl mb-4">👨‍👩‍👧‍👦</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Contrôle parental</h3>
                <p className="text-gray-600">
                  Gérez les horaires d'écoute, les contenus accessibles et suivez l'activité musicale de vos enfants.
                </p>
              </div>
            </div>
            
            {/* CTA Section */}
            <div className="patou-card bg-gradient-to-r from-patou-green-50 to-patou-blue-50 border-patou-green-200">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Prêt à commencer l'aventure musicale ?
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  Créez votre compte parent et configurez les profils de vos enfants en quelques minutes.
                </p>
                <Link to="/parent/signup" className="btn btn--primary btn--large">
                  Créer un compte gratuit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}