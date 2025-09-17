import { Link } from 'react-router-dom'
import { LogOut, Settings, Users } from 'lucide-react'

interface HeaderProps {
  showNavigation?: boolean
  onSignOut?: () => void
}

export default function Header({ showNavigation = false, onSignOut }: HeaderProps) {
  return (
    <header className="patou-header">
      <div className="patou-header-content">
        <Link to="/" className="patou-logo">
          <img 
            src="/Patou emeraude sans fond.png" 
            alt="Patou Logo" 
          />
          Patou
        </Link>
        
        {showNavigation && (
          <nav className="flex items-center gap-4">
            <Link 
              to="/parent/children" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-patou-green transition-colors"
            >
              <Users size={16} />
              Enfants
            </Link>
            <Link 
              to="/parent/settings" 
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-patou-green transition-colors"
            >
              <Settings size={16} />
              Paramètres
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-500 transition-colors"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}