import { Link } from 'react-router-dom'
import { Shield, Users, Music, Check } from 'lucide-react'
import PatouCard, { CardPatterns } from '../../components/ui/PatouCard'
import PatouButton, { ButtonPatterns } from '../../components/ui/PatouButton'

interface HomeProps {
  onLogin?: () => void
  onSignup?: () => void
  onChildSpace?: () => void
  onParentSpace?: () => void
}

export default function Home({ onLogin, onSignup, onChildSpace, onParentSpace }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Hero Section */}
      <section className="py-16 md:py-24 animate-fade-in">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Colonne gauche - Texte */}
            <div className="text-center lg:text-left animate-slide-up">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Musique en famille,<br />
                en toute sécurité
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-2xl">
                Offrez à vos enfants une expérience musicale adaptée à leur âge, 
                sans contenus inappropriés.
              </p>

              {/* Badges sécurité */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full animate-slide-left" style={{ animationDelay: '0.2s' }}>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full animate-slide-left" style={{ animationDelay: '0.4s' }}>
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Contrôle parental + sans publicité</span>
                </div>
              </div>

              {/* Boutons principaux */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <ButtonPatterns.CTA
                  onClick={onSignup || (() => window.location.href = '/parent/signup')}
                  animation="slideUp"
                  animationDelay="0.6s"
                >
                  Créer mon compte gratuit
                </ButtonPatterns.CTA>
                
                <PatouButton
                  variant="secondary"
                  size="lg"
                  onClick={onChildSpace || (() => window.location.href = '/child/login')}
                  animation="slideUp"
                  animationDelay="0.8s"
                >
                  Espace enfant
                </PatouButton>
                
                <PatouButton
                  variant="outline"
                  size="lg"
                  onClick={onLogin || (() => window.location.href = '/parent/login')}
                  animation="slideUp"
                  animationDelay="1s"
                >
                  Se connecter
                </PatouButton>
              </div>
            </div>

            {/* Colonne droite - Image */}
            <div className="flex justify-center lg:justify-end animate-scale-in" style={{ animationDelay: '0.4s' }}>
              <PatouCard variant="bento" className="bg-gradient-patou text-white text-center animate-pulse-glow">
                <div className="text-6xl mb-4 animate-bounce-gentle">🎵</div>
                <h3 className="text-xl font-semibold mb-2">Musique sécurisée</h3>
                <p className="opacity-90">Contenu vérifié et adapté à chaque âge</p>
              </PatouCard>
            </div>
          </div>
        </div>
      </section>

      {/* Section confiance */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-50 rounded-2xl p-8 mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Rejoignez les familles qui font confiance à Patou
            </h2>
            <button
              onClick={onSignup || (() => window.location.href = '/parent/signup')}
              className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
            >
              Créer mon compte
            </button>
          </div>
          
          <h3 className="text-xl font-semibold text-green-600 mb-8">
            Pourquoi les parents choisissent Patou
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardPatterns.Feature
              icon={<Shield className="w-8 h-8 text-protect" />}
              title="Sécurité garantie"
              description="Filtrage automatique des contenus inappropriés. Contrôle parental avancé."
              action={
                <span className="inline-block bg-protect text-white px-3 py-1 rounded-full text-sm font-medium">
                  100% Sûr
                </span>
              }
            />
            
            <CardPatterns.Feature
              icon={<Users className="w-8 h-8 text-share" />}
              title="Moments partagés"
              description="Créez des moments musicaux en famille. Partagez vos découvertes et souvenirs musicaux."
              action={
                <span className="inline-block bg-share text-white px-3 py-1 rounded-full text-sm font-medium">
                  Ensemble
                </span>
              }
            />
            
            <CardPatterns.Feature
              icon={<Music className="w-8 h-8 text-awaken-dark" />}
              title="Éveil musical"
              description="Des recommandations adaptées à l'âge pour développer la curiosité musicale."
              action={
                <span className="inline-block bg-awaken text-awaken-dark px-3 py-1 rounded-full text-sm font-medium">
                  Créatif
                </span>
              }
            />
          </div>
        </div>
      </section>

      {/* Les piliers de Patou */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gradient-patou mb-8">Les piliers de Patou</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Protection garantie */}
            <PatouCard variant="feature" className="text-center group bg-protect-bg border-protect/20" animation="slideUp" animationDelay="0.2s">
              <div className="p-4 rounded-full bg-protect/10 w-fit mx-auto mb-6 group-hover:bg-protect/20 transition-colors">
                <Shield className="w-8 h-8 text-protect group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Protection garantie</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Un environnement sécurisé 100% adapté aux enfants. Filtrage automatique des contenus inappropriés.
              </p>
              <span className="inline-block bg-protect text-white px-3 py-1 rounded-full text-sm font-medium">
                Sûr
              </span>
            </PatouCard>
            
            {/* Partage en famille */}
            <PatouCard variant="feature" className="text-center group bg-share-bg border-share/20" animation="slideUp" animationDelay="0.4s">
              <div className="p-4 rounded-full bg-share/10 w-fit mx-auto mb-6 group-hover:bg-share/20 transition-colors">
                <Users className="w-8 h-8 text-share group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Partage en famille</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Créez des moments musicaux en famille. Partagez vos découvertes et souvenirs via liens.
              </p>
              <span className="inline-block bg-share text-white px-3 py-1 rounded-full text-sm font-medium">
                Social
              </span>
            </PatouCard>
            
            {/* Éveil musical */}
            <PatouCard variant="feature" className="text-center group bg-awaken-bg border-awaken/20" animation="slideUp" animationDelay="0.6s">
              <div className="p-4 rounded-full bg-awaken/20 w-fit mx-auto mb-6 group-hover:bg-awaken/30 transition-colors">
                <Music className="w-8 h-8 text-awaken-dark group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Éveil musical et créativité</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Développez la curiosité musicale de vos enfants avec des contenus adaptés à leur âge.
              </p>
              <span className="inline-block bg-awaken text-awaken-dark px-3 py-1 rounded-full text-sm font-medium">
                Créatif
              </span>
            </PatouCard>
          </div>
        </div>
      </section>

      {/* Section Player Preview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Lecteur Musical Sécurisé</h2>
            <p className="text-gray-600">Interface simple et sécurisée pour vos enfants</p>
          </div>
          
          {/* Mock Player */}
          <PatouCard variant="bento" className="max-w-2xl mx-auto bg-gradient-to-br from-gray-900 to-black text-white">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-patou rounded-lg flex items-center justify-center text-2xl animate-float">
                🎵
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-lg">Chanson pour enfants</h4>
                <p className="text-gray-300">Artiste kid-friendly</p>
                <p className="text-gray-400 text-sm">Album Disney</p>
              </div>
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <Shield className="w-5 h-5 text-protect" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <span>1:30</span>
                <div className="flex-1 bg-gray-700 rounded-full h-2">
                  <div className="bg-gradient-primary h-2 rounded-full transition-all" style={{ width: '45%' }}></div>
                </div>
                <span>3:20</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>
              
              <button className="bg-gradient-primary hover:opacity-90 text-white rounded-full p-4 transition-all transform hover:scale-105">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15" />
                </svg>
              </button>
              
              <button className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 4a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H15a1 1 0 011 1v11a1 1 0 01-1 1H6a1 1 0 01-1-1V4z" />
                </svg>
              </button>
            </div>
          </PatouCard>
        </div>
      </section>

      {/* Expérience musicale complète */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Une expérience musicale complète
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <img 
                src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Contrôle parental simple"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contrôle parental simple</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Expérience de navigation lisse sur mobile et desktop. Contrôle parental à la portée d'un clic.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <img 
                src="https://images.pexels.com/photos/4348401/pexels-photo-4348401.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Playlists adaptées"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Playlists adaptées</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Contenus triés automatiquement selon l'âge de vos enfants.
              </p>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
              <img 
                src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Interface enfant ludique"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Interface enfant ludique</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Une expérience simple et intuitive pour vos petits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 bg-gradient-patou text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Rejoignez les familles qui font confiance à Patou
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Offrez à vos enfants une expérience musicale adaptée à leur âge, sans contenus inappropriés.
          </p>
          <PatouButton
            variant="secondary"
            size="xl"
            onClick={onSignup || (() => window.location.href = '/parent/signup')}
            className="bg-white text-primary hover:bg-gray-100"
            animation="scaleIn"
          >
            Créer mon compte
          </PatouButton>
        </div>
      </section>
    </div>
  )
}