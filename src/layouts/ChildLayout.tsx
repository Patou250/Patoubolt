import React from 'react'
import { useLocation } from 'react-router-dom'
import { App, Page, Tabbar, Tab, TabbarLink } from 'konsta/react'
import { Music, Heart, List, Search } from 'lucide-react'

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
        {/* Content wrapper - mobile full width, desktop centered */}
        <div className="w-full max-w-[420px] md:max-w-[480px] mx-auto min-h-screen pb-16">
          {children}
        </div>
        
        {/* Fixed bottom tabbar */}
        <Tabbar labels className="fixed bottom-0 left-0 right-0 z-50">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = getActiveTab() === tab.id
            
            return (
              <Tab key={tab.id}>
                <TabbarLink
                  href={tab.path}
                  className={`flex flex-col items-center justify-center py-2 ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{tab.label}</span>
                </TabbarLink>
              </Tab>
            )
          })}
        </Tabbar>
      </Page>
    </App>
  )
}