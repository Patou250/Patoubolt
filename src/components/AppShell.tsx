import React from 'react'
import { Header } from './Header'

console.log('🚀 APPSHELL - Module AppShell.tsx chargé')

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  console.log('🚀 APPSHELL - Rendu du shell de l\'application')
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}