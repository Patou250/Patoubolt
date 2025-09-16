import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="text-center max-w-md w-full space-y-8">
        {/* Logo et titres */}
        <div className="space-y-6">
          <img 
            src="/patou-logo.svg" 
            alt="Patou" 
            className="h-20 w-auto mx-auto"
          />
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-gray-900">
              Patou
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Musique sécurisée pour toute la famille
            </p>
          </div>
        </div>

        {/* Boutons d'accès */}
        <div className="space-y-4">
          <Link
            to="/parent/login"
            className="block w-full bg-emerald-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-emerald-700 transition-colors duration-200 min-h-[44px] flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Je suis parent
          </Link>
          
          <Link
            to="/child/login"
            className="block w-full bg-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-purple-700 transition-colors duration-200 min-h-[44px] flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Espace enfant
          </Link>
        </div>
      </div>
    </div>
  )
}