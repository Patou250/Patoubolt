import { Link, NavLink } from 'react-router-dom'

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-100">
      <div className="mx-auto max-w-6xl h-14 px-4 md:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/patou-logo.svg" alt="Patou" className="h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm">
          <NavLink to="/parent/login" className="text-gray-600 hover:text-gray-900">
            Espace parent
          </NavLink>
          <NavLink to="/child" className="text-gray-600 hover:text-gray-900">
            Espace enfant
          </NavLink>
          <Link
            to="/parent/signup"
            className="ml-2 inline-flex items-center rounded-lg bg-primary px-3 py-1.5 text-white font-semibold hover:brightness-95"
          >
            Créer un compte
          </Link>
        </nav>
      </div>
    </header>
  )
}