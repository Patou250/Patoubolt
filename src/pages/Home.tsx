import { Link } from 'react-router-dom'
import { ShieldCheck, Users, SunMedium, Shield, Heart, Music } from 'lucide-react'
import PublicLayout from '../layouts/PublicLayout'

export default function Home() {
  return (
    <PublicLayout>
      {/* HERO SECTION */}
      <section className="text-center py-16 md:py-24">
        <div className="mb-8">
          <img src="/patou-logo.svg" alt="Patou Logo" className="h-16 mx-auto mb-6" />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Texte principal */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Musique en famille,<br />
                en toute sécurité
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Offrez à vos enfants une expérience musicale adaptée à leur âge, 
                sans contenus inappropriés.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Link
                  to="/signup-parent"
                  className="inline-flex items-center justify-center px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Créer mon compte gratuit
                </Link>
                <Link
                  to="/login-enfant"
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-100 text-blue-700 font-semibold rounded-full hover:bg-blue-200 transition-all duration-300"
                >
                  Espace enfant
                </Link>
                <Link
                  to="/login-parent"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all duration-300"
                >
                  Se connecter
                </Link>
              </div>
              
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>100% sécurisé</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span>Contrôle parental + sans publicité</span>
                </div>
              </div>
            </div>
            
            {/* Image */}
            <div className="flex justify-center">
              <img 
                src="https://images.pexels.com/photos/3985062/pexels-photo-3985062.jpeg?auto=compress&cs=tinysrgb&w=600" 
                alt="Famille écoutant de la musique ensemble"
                className="rounded-2xl shadow-2xl max-w-sm w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION CONFIANCE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Rejoignez les familles qui font confiance à Patou
            </h2>
            <Link
              to="/signup-parent"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-600 transition-all duration-300"
            >
              Créer mon compte
            </Link>
          </div>
          
          <h3 className="text-xl font-semibold text-primary mb-8">
            Pourquoi les parents choisissent Patou
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Sécurité garantie</h4>
              <p className="text-sm text-gray-600">
                Filtrage automatique des contenus inappropriés. Contrôle parental avancé.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Moments partagés</h4>
              <p className="text-sm text-gray-600">
                Créez des moments musicaux en famille. Partagez vos découvertes et souvenirs musicaux.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Music className="w-8 h-8 text-gray-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Éveil musical</h4>
              <p className="text-sm text-gray-600">
                Des recommandations adaptées à l'âge pour développer la curiosité musicale.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* LES PILIERS DE PATOU */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Les piliers de Patou
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Protection garantie */}
            <div className="bg-blue-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Protection garantie</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Un environnement sécurisé 100% adapté aux enfants. Filtrage automatique des contenus inappropriés.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                Sûr
              </div>
            </div>
            
            {/* Partage en famille */}
            <div className="bg-pink-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-pink-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Partage en famille</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Créez des moments musicaux en famille. Partagez vos découvertes et souvenirs via liens.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
                Social
              </div>
            </div>
            
            {/* Éveil musical et créativité */}
            <div className="bg-yellow-50 rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <SunMedium className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Éveil musical et créativité</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Développez la curiosité musicale de vos enfants avec des contenus adaptés à leur âge.
              </p>
              <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                Créatif
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXPÉRIENCE MUSICALE COMPLÈTE */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Une expérience musicale complète
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Contrôle parental simple */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <img 
                src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Contrôle parental"
                className="w-full h-48 object-cover rounded-xl mb-4"
              />
              <h3 className="text-lg font-bold text-gray-900 mb-2">Contrôle parental simple</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Expérience de navigation lisse sur mobile et desktop. Contrôle parental à la portée d'un clic.
              </p>
            </div>
            
            {/* Playlists adaptées */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
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
            
            {/* Interface enfant ludique */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <img 
                src="https://images.pexels.com/photos/4144923/pexels-photo-4144923.jpeg?auto=compress&cs=tinysrgb&w=400" 
                alt="Interface enfant"
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

      {/* CTA FINAL */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary to-protect text-white rounded-2xl p-8 md:p-12 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Prêt à offrir une expérience musicale sécurisée ?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Rejoignez les familles qui font confiance à Patou pour protéger et éveiller leurs enfants.
            </p>
            <Link
              to="/signup-parent"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary font-bold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg"
            >
              Rejoindre la bêta gratuitement
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}