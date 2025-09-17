import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, Music, Heart, Settings } from 'lucide-react'

interface NavigationProps {
  userType?: 'parent' | 'child'
}

export default function Navigation({ userType = 'child' }: NavigationProps) {
  const location = useLocation()

  const navigationItems = [
    {
      id: 'home',
      label: 'Accueil',
      icon: Home,
      path: userType === 'child' ? '/child' : '/parent/dashboard'
    },
    {
      id: 'player',
      label: 'Lecteur',
      icon: Music,
      path: userType === 'child' ? '/child' : '/player'
    },
    {
      id: 'favorites',
      label: 'Favoris',
      icon: Heart,
      path: userType === 'child' ? '/child/favorites' : '/parent/favorites'
    },
    {
      id: 'settings',
      label: 'Réglages',
      icon: Settings,
      path: userType === 'child' ? '/child/settings' : '/parent/settings'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/child' && location.pathname === '/child') return true
    if (path === '/parent/dashboard' && location.pathname === '/parent/dashboard') return true
    return location.pathname.startsWith(path) && path !== '/child' && path !== '/parent/dashboard'
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          {navigationItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.path)
            
            return (
              <Link
                key={item.id}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                  active
                    ? 'text-patou-green bg-patou-green-50'
                    : 'text-gray-500 hover:text-patou-green hover:bg-patou-green-50'
                }`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Desktop Sidebar Navigation */}
      <nav className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-40">
        <div className="flex flex-col w-full">
          {/* Logo Section */}
          <div className="p-6 border-b border-gray-200">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/Patou emeraude sans fond.png" 
                alt="Patou Logo" 
                className="h-10 w-auto"
              />
              <span className="text-xl font-bold text-patou-green">Patou</span>
            </Link>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 p-4">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                
                return (
                  <Link
                    key={item.id}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      active
                        ? 'text-patou-green bg-patou-green-50 border border-patou-green-200'
                        : 'text-gray-600 hover:text-patou-green hover:bg-patou-green-50'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Type Indicator */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                userType === 'parent' ? 'bg-patou-blue' : 'bg-patou-orange'
              }`} />
              <span className="text-sm font-medium text-gray-600 capitalize">
                {userType === 'parent' ? 'Espace Parent' : 'Espace Enfant'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* Desktop Content Spacer */}
      <div className="hidden md:block w-64 flex-shrink-0" />
    </>
  )
}