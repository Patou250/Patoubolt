import { Link } from 'react-router-dom'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen bg-background-page text-text-primary">
      {/* Header WeWeb Pattern - Fixed */}
      <header className="weweb-header-public">
        <div className="weweb-container">
          {/* Logo gauche */}
          <Link to="/" className="flex items-center">
            <img src="/patou-logo.svg" alt="Patou" className="h-8" />
          </Link>

          {/* Navigation desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/parent/login"
              className="text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              Espace parent
            </Link>
            <Link
              to="/child/login"
              className="text-text-secondary hover:text-text-primary transition-colors duration-300"
            >
              Espace enfant
            </Link>
          </nav>

          {/* Boutons droite */}
          <div className="flex items-center gap-3">
            <Link
              to="/parent/login"
              className="weweb-btn-secondary hidden sm:inline-flex"
            >
              Se connecter
            </Link>
            <Link
              to="/parent/signup"
              className="weweb-btn-primary"
            >
              Créer un compte
            </Link>
          </div>
        </div>
      </header>

      {/* Main content avec margin-top pour header fixe */}
      <main className="weweb-content-public">
        <div className="weweb-container">
          {children}
        </div>
      </main>

      {/* Footer WeWeb Pattern */}
      <footer className="weweb-footer-public">
        <div className="weweb-container">
          <div className="text-center">
            <p className="text-sm text-text-secondary">
              © 2025 Patou — Protéger • Partager • Éveiller
            </p>
            <div className="flex justify-center gap-6 mt-4 text-sm">
              <Link to="/privacy" className="text-text-secondary hover:text-primary transition-colors">
                Confidentialité
              </Link>
              <Link to="/terms" className="text-text-secondary hover:text-primary transition-colors">
                CGU
              </Link>
              <Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}