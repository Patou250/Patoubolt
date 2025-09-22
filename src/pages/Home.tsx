import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  const handleParentLogin = () => {
    console.log('🔗 Navigate to parent login')
    navigate('/parent/login')
  }

  const handleParentSignup = () => {
    console.log('🔗 Navigate to parent signup')
    navigate('/parent/signup')
  }

  const handleChildLogin = () => {
    console.log('🔗 Navigate to child login')
    navigate('/child/login')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/patou-logo.svg" alt="Patou" className="h-10" />
              <span className="text-2xl font-bold text-green-600">Patou</span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleParentLogin}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Se connecter
              </button>
              <button
                onClick={handleParentSignup}
                className="px-6 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
              >
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Musique sécurisée pour enfants
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            Offrez à vos enfants une expérience musicale adaptée à leur âge, 
            sans contenus inappropriés.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <button
              onClick={handleParentSignup}
              className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-full hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Créer mon compte parent
            </button>
            
            <button
              onClick={handleChildLogin}
              className="px-8 py-4 bg-blue-500 text-white font-bold text-lg rounded-full hover:bg-blue-600 transition-all transform hover:scale-105 shadow-lg"
            >
              Espace enfant
            </button>
            
            <button
              onClick={handleParentLogin}
              className="px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold text-lg rounded-full hover:bg-gray-50 transition-all"
            >
              Se connecter
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Pourquoi choisir Patou ?
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Sécurité garantie</h3>
              <p className="text-gray-600">
                Filtrage automatique des contenus inappropriés. Contrôle parental avancé.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👨‍👩‍👧‍👦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Partage en famille</h3>
              <p className="text-gray-600">
                Créez des moments musicaux en famille. Partagez vos découvertes.
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎵</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Éveil musical</h3>
              <p className="text-gray-600">
                Développez la curiosité musicale avec des contenus adaptés.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}