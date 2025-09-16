import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
      <div className="text-center max-w-md w-full">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/patou-logo.svg" 
            alt="Patou" 
            className="h-20 w-auto mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Patou
          </h1>
          <p className="text-lg text-gray-600">
            Musique sécurisée pour toute la famille
          </p>
        </div>

        {/* Boutons */}
        <div className="space-y-4">
          <Link
            to="/parent/login"
            className="block w-full bg-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-emerald-700 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Je suis parent
          </Link>
          
          <Link
            to="/child/login"
            className="block w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors min-h-[44px] flex items-center justify-center"
          >
            Espace enfant
          </Link>
        </div>
      </div>
    </div>
  )
}