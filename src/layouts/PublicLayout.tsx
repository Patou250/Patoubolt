import { Link } from 'react-router-dom'
import { getLayoutGuidelines } from '../utils/interactions'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const layoutGuidelines = getLayoutGuidelines('public', 'desktop')
  
  return (
    <div className="min-h-screen bg-background-page text-text-primary" data-layout="public">
      {/* Header WeWeb Pattern - Fixed */}
      <header 
        className="weweb-header-public"
        data-component="header"
        style={{
          height: layoutGuidelines.header?.height,
          padding: layoutGuidelines.header?.padding,
          position: layoutGuidelines.header?.position as any,
          backgroundColor: layoutGuidelines.header?.backgroundColor,
          borderBottom: layoutGuidelines.header?.borderBottom,
          boxShadow: layoutGuidelines.header?.boxShadow,
          backdropFilter: layoutGuidelines.header?.backdropFilter
        }}
      >
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
      <main 
        className="weweb-content-public"
        style={{
          marginTop: layoutGuidelines.header?.height,
          padding: `${layoutGuidelines.content?.padding?.split(' ')[0] || '48px'} 0`
        }}
      >
        <div className="weweb-container">
          {children}
        </div>
      </main>

      {/* Footer WeWeb Pattern */}
      <footer 
        className="weweb-footer-public"
        style={{
          padding: layoutGuidelines.footer?.padding,
          borderTop: layoutGuidelines.footer?.borderTop
        }}
      >
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