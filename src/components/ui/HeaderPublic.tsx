import { Link } from 'react-router-dom'

interface HeaderPublicProps {
  onLogin?: () => void
  onSignup?: () => void
  onChildSpace?: () => void
  onParentSpace?: () => void
}

export default function HeaderPublic({ onLogin, onSignup, onChildSpace, onParentSpace }: HeaderPublicProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/patou-logo.svg" alt="Patou" className="h-8 w-auto" />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={onParentSpace || (() => window.location.href = '/parent/login')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Espace parent
            </button>
            
            <button
              onClick={onChildSpace || (() => window.location.href = '/child/login')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Espace enfant
            </button>
          </nav>

          {/* Boutons droite */}
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin || (() => window.location.href = '/parent/login')}
              className="hidden sm:inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Se connecter
            </button>
            
            <button
              onClick={onSignup || (() => window.location.href = '/parent/signup')}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors"
            >
              Créer un compte
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}