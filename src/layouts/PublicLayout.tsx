import { Link } from 'react-router-dom'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-bgPage text-textMain">
      {/* Header sticky */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-4 md:px-8 h-16 flex items-center justify-between">
          {/* Logo gauche */}
          <Link to="/" className="flex items-center">
            <img src="/patou-logo.svg" alt="Patou" className="h-7" />
          </Link>

          {/* Boutons droite */}
          <div className="flex items-center gap-3">
            <Link
              to="/parent/login"
              className="px-4 py-2 border border-protect text-protect rounded-lg font-medium hover:bg-protect/5 transition-colors"
            >
              Se connecter
            </Link>
            <Link
              to="/parent/signup"
              className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:brightness-95 transition-all"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-4 md:px-8">
        {children}
      </main>

      {/* Footer simple */}
      <footer className="mt-auto py-8 border-t border-gray-200 bg-white/50">
        <div className="mx-auto max-w-6xl px-4 md:px-8 text-center">
          <p className="text-sm text-textMuted">
            © 2025 Patou — Protéger • Partager • Éveiller
          </p>
        </div>
      </footer>
    </div>
  )
}