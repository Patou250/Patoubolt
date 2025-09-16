import { Link, useLocation } from 'react-router-dom'
import styles from './Header.module.css'

export function Header() {
  const { pathname } = useLocation()
  const isHome = pathname === '/'
  
  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-background/60 border-b border-white/10">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src="/patou-logo.svg" alt="Patou" className="h-8" />
          <span className="text-xl font-semibold hidden sm:inline">Patou</span>
        </Link>
      </div>
    </header>
  )
}