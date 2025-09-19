import { ReactNode } from 'react'
import Header from './Header'
import Footer from './Footer'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1200px] px-4 md:px-8 py-6">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  )
}