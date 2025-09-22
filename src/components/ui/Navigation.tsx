import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Music, Settings, BarChart3, Heart, Search, Calendar } from 'lucide-react'

export default function Navigation() {
  const location = useLocation()

  // Déterminer le contexte utilisateur
  const isParentSpace = location.pathname.startsWith('/parent') || location.pathname.startsWith('/dashboard')
  const isChildSpace = location.pathname.startsWith('/child')

  console.log('🧭 Navigation context:', { 
    pathname: location.pathname, 
    isParentSpace, 
    isChildSpace 
  })

  const parentNavItems = [
    { path: '/parent/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/parent/children', icon: Users, label: 'Enfants' },
    { path: '/parent/curation', icon: Calendar, label: 'Curation' },
    { path: '/parent/settings', icon: Settings, label: 'Paramètres' },
  ]

  const childNavItems = [
    { path: '/child', icon: Music, label: 'Player' },
    { path: '/child/favorites', icon: Heart, label: 'Favoris' },
    { path: '/child/playlists', icon: Music, label: 'Playlists' },
    { path: '/child/search', icon: Search, label: 'Recherche' },
  ]

  const navItems = isChildSpace ? childNavItems : parentNavItems
  const contextColor = isChildSpace ? 'awaken' : 'protect'

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-gray-200/50 z-40 md:hidden safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path || 
                          (item.path === '/child' && location.pathname === '/child')
          
          console.log('🔗 Nav item:', item.path, 'active:', isActive)
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? `text-${contextColor} bg-${contextColor}/10`
                  : 'text-text-secondary hover:text-text-primary hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}