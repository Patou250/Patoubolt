import { Link, useLocation } from 'react-router-dom'
import { Home, Users, Settings, BarChart3, Shield, Calendar, Music, Heart, Search } from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  userType?: 'parent' | 'child'
}

export default function AppLayout({ children, userType = 'parent' }: AppLayoutProps) {
  const location = useLocation()

  const parentNavItems = [
    { id: 'dashboard', path: '/parent/dashboard', label: 'Dashboard', icon: Home },
    { id: 'children', path: '/parent/children', label: 'Enfants', icon: Users },
    { id: 'curation', path: '/parent/curation', label: 'Curation', icon: Calendar },
    { id: 'insights', path: '/parent/insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', path: '/parent/settings', label: 'Paramètres', icon: Settings }
  ]

  const childNavItems = [
    { id: 'player', path: '/child', label: 'Player', icon: Music },
    { id: 'favorites', path: '/child/favorites', label: 'Favoris', icon: Heart },
    { id: 'playlists', path: '/child/playlists', label: 'Playlists', icon: List },
    { id: 'search', path: '/child/search', label: 'Recherche', icon: Search }
  ]

  const navItems = userType === 'parent' ? parentNavItems : childNavItems
  const contextColor = userType === 'parent' ? 'protect' : 'awaken'

  const isActive = (path: string) => {
    if (path === '/child' && location.pathname === '/child') return true
    if (path !== '/child' && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="weweb-app-layout">
      {/* Sidebar Desktop WeWeb Pattern */}
      <aside className="weweb-sidebar-app">
        <div className="p-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src="/patou-logo.svg" alt="Patou" className="h-8" />
            <span className="font-bold text-lg text-white">Patou</span>
          </Link>

          {/* Navigation */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`weweb-nav-item ${
                    active 
                      ? `weweb-nav-active-${contextColor}` 
                      : 'weweb-nav-inactive'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content WeWeb Pattern */}
      <main className="weweb-content-app">
        {children}
      </main>

      {/* Mobile Navigation WeWeb Pattern */}
      <nav className="weweb-mobile-nav-app md:hidden">
        <div className="flex items-center justify-around h-full">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-all duration-300 ${
                  active 
                    ? `text-${contextColor} bg-${contextColor}/10` 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}