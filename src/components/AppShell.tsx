import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './Header'
import Footer from './Footer'

export default function AppShell() {
  const { pathname } = useLocation()
  const isChildArea = pathname.startsWith('/child')

  return (
    <div className="min-h-screen bg-app-gradient text-app-foreground flex flex-col">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6">
        <Outlet />
      </main>

      {/* Footer/nav: pas en mode enfant */}
      {!isChildArea && <Footer />}
    </div>
  )
}