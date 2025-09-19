import React from 'react'
import { useLocation } from 'react-router-dom'
import { App, Page, Tabbar, TabbarLink } from 'konsta/react'
import { Music, Heart, List, Search, Clock, Sparkles } from 'lucide-react'

interface ChildLayoutProps {
  children: React.ReactNode
}

export default function ChildLayout({ children }: ChildLayoutProps) {
  const location = useLocation()
  
  const tabs = [
    {
      id: 'player',
      path: '/child',
      label: 'Player',
      icon: Music
    },
    {
      id: 'favorites', 
      path: '/child/favorites',
      label: 'Favoris',
      icon: Heart
    },
    {
      id: 'playlists',
      path: '/child/playlists', 
      label: 'Playlists',
      icon: List
    },
    {
      id: 'search',
      path: '/child/search',
      label: 'Recherche', 
      icon: Search
    }
  ]

  const getActiveTab = () => {
    const currentPath = location.pathname
    if (currentPath === '/child') return 'player'
    if (currentPath.startsWith('/child/favorites')) return 'favorites'
    if (currentPath.startsWith('/child/playlists')) return 'playlists'
    if (currentPath.startsWith('/child/search')) return 'search'
    return 'player'
  }

  return (
    <App theme="ios">
      <Page>
        {/* Desktop layout with aside */}
        <div className="flex justify-center min-h-screen">
          {/* Main content wrapper */}
          <div className="w-full max-w-[420px] md:max-w-[480px] min-h-screen pb-16 md:pb-0">
            {children}
          </div>
          
          {/* Desktop aside - only visible on lg+ */}
          <aside className="hidden lg:block w-[320px] ml-6 p-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-gray-900">Suggestions</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <img 
                    src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=60" 
                    alt="Suggestion"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Hakuna Matata</p>
                    <p className="text-xs text-gray-500 truncate">Le Roi Lion</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <img 
                    src="https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=60" 
                    alt="Suggestion"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Let It Go</p>
                    <p className="text-xs text-gray-500 truncate">La Reine des Neiges</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                  <img 
                    src="https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg?auto=compress&cs=tinysrgb&w=60" 
                    alt="Suggestion"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Under the Sea</p>
                    <p className="text-xs text-gray-500 truncate">La Petite Sirène</p>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <h4 className="text-sm font-medium text-gray-700">Récemment écouté</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-primary to-protect rounded-md flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 truncate">Belle et la Bête</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-share to-awaken rounded-md flex items-center justify-center">
                      <Music className="w-3 h-3 text-white" />
                    </div>
                    <p className="text-xs text-gray-600 truncate">Moana - Océania</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
        
        {/* Fixed bottom tabbar - only on mobile */}
        <Tabbar labels className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = getActiveTab() === tab.id
            
            return (
              <TabbarLink
                key={tab.id}
                href={tab.path}
                className={`flex flex-col items-center justify-center py-2 ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{tab.label}</span>
              </TabbarLink>
            )
          })}
        </Tabbar>
      </Page>
    </App>
  )
}