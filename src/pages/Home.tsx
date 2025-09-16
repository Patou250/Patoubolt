import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen">
      <div className="bento-container">
        {/* Hero Section */}
        <div className="bento-hero bento-animate">
          <div className="flex items-center justify-center mb-8">
            <img 
              src="/Patou emeraude sans fond.png" 
              alt="Patou" 
              className="h-12 w-auto"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Playlists enfants, sereines pour les parents
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-2xl mx-auto">
            Contrôle parental intelligent pour Spotify
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/parent/login" 
              className="btn btn--awaken btn--large"
              aria-label="Se connecter en tant que parent"
            >
              <span className="text-2xl mr-2">👨‍👩‍👧‍👦</span>
              Espace Parent
            </Link>
            <Link 
              to="/child/login" 
              className="btn btn--share btn--large"
              aria-label="Accéder à l'espace enfant"
            >
              <span className="text-2xl mr-2">🎵</span>
              Espace Enfant
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="bento-grid-3">
          {/* Protéger */}
          <div className="bento-card bento-card--protect bento-animate">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">🛡️</span>
              </div>
              <h3 className="text-2xl font-bold text-protect mb-4">Protéger</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Contrôle parental avancé avec filtrage du contenu explicite et gestion des horaires d'écoute
              </p>
            </div>
          </div>

          {/* Partager */}
          <div className="bento-card bento-card--share bento-animate">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-bold text-share mb-4">Partager</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Créez des moments musicaux en famille avec des playlists partagées et des découvertes communes
              </p>
            </div>
          </div>

          {/* Éveiller */}
          <div className="bento-card bento-card--awaken bento-animate">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 bg-white rounded-full flex items-center justify-center">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="text-2xl font-bold text-awaken-700 mb-4">Éveiller</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Développez la curiosité musicale de vos enfants avec des contenus éducatifs et adaptés à leur âge
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bento-grid-4">
          <div className="bento-card bento-animate text-center">
            <div className="text-4xl font-bold text-patou mb-2">100%</div>
            <div className="text-gray-600">Sécurisé</div>
          </div>
          <div className="bento-card bento-animate text-center">
            <div className="text-4xl font-bold text-protect mb-2">24/7</div>
            <div className="text-gray-600">Protection</div>
          </div>
          <div className="bento-card bento-animate text-center">
            <div className="text-4xl font-bold text-share mb-2">∞</div>
            <div className="text-gray-600">Playlists</div>
          </div>
          <div className="bento-card bento-animate text-center">
            <div className="text-4xl font-bold text-awaken-700 mb-2">+1M</div>
            <div className="text-gray-600">Chansons</div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bento-feature bento-card bento-card--primary bento-animate">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-patou mb-4">
              Prêt à offrir une expérience musicale sécurisée à vos enfants ?
            </h2>
            <p className="text-gray-700 text-lg mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de familles qui font confiance à Patou pour une écoute musicale sereine et éducative.
            </p>
            <Link 
              to="/parent/login" 
              className="btn btn--primary btn--large"
            >
              <span className="text-xl mr-2">🚀</span>
              Commencer maintenant
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}