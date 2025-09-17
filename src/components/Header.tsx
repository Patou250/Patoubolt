import { Link } from 'react-router-dom'
import { LogOut, Settings, Users } from 'lucide-react'

interface HeaderProps {
  showNavigation?: boolean
  onSignOut?: () => void
}

export default function Header({ showNavigation = false, onSignOut }: HeaderProps) {
  return (
    <header className="header-patou">
      <div className="container-patou py-4">
        <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <span className="text-xl font-bold text-primary">Patou</span>
        </Link>
        
        {showNavigation && (
          <nav className="flex items-center gap-4">
            <Link 
              to="/parent/children" 
              className="nav-item-inactive"
            >
              <Users size={16} />
              Enfants
            </Link>
            <Link 
              to="/parent/settings" 
              className="nav-item-inactive"
            >
              <Settings size={16} />
              Paramètres
            </Link>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="nav-item-inactive hover:text-red-500"
              >
                <LogOut size={16} />
                Déconnexion
              </button>
            )}
          </nav>
        )}
        </div>
      </div>
    </header>
  )
}