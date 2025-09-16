import { Link } from 'react-router-dom'

export function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl h-14 px-4 flex items-center">
        <Link to="/" className="flex items-center gap-2">
          <img src="/patou-logo.svg" alt="Patou" className="h-8 w-8" />
          <span className="text-lg font-semibold text-gray-900">Patou</span>
        </Link>
      </div>
    </header>
  )
}

export default Header