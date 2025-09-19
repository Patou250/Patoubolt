import { Link } from 'react-router-dom'
import { Users, Baby } from 'lucide-react'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-[1200px] px-4 md:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/Patou emeraude sans fond.png" 
            alt="Patou" 
            className="h-8 w-auto"
          />
          <span className="font-extrabold text-primary text-lg">Patou</span>
        </Link>

        {/* Home link - center on mobile, hidden on desktop */}
        <Link 
          to="/" 
          className="md:hidden font-semibold text-gray-700 hover:text-primary transition-colors"
        >
          Accueil
        </Link>

        {/* Navigation buttons - hidden on mobile, visible on desktop */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/parent/login"
            className="flex items-center gap-2 px-4 py-2 bg-protect text-white rounded-lg hover:bg-protect-600 transition-colors text-sm font-medium"
          >
            <Users className="w-4 h-4" />
            Espace Parent
          </Link>
          <Link
            to="/child/login"
            className="flex items-center gap-2 px-4 py-2 bg-awaken text-gray-900 rounded-lg hover:bg-awaken-600 transition-colors text-sm font-medium"
          >
            <Baby className="w-4 h-4" />
            Espace Enfant
          </Link>
        </div>
      </div>
    </header>
  )
}