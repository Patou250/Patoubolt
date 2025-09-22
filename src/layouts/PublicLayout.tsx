import { useNavigate } from 'react-router-dom'
import HeaderPublic from '../components/ui/HeaderPublic'
import Footer from '../components/ui/Footer'

interface PublicLayoutProps {
  children: React.ReactNode
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  const navigate = useNavigate()
  
  const handleLogin = () => navigate('/parent/login')
  const handleSignup = () => navigate('/parent/signup')
  const handleChildSpace = () => navigate('/child/login')
  const handleParentSpace = () => navigate('/parent/login')
  
  return (
    <div className="min-h-screen bg-gray-50" data-layout="public">
      <HeaderPublic 
        onLogin={handleLogin}
        onSignup={handleSignup}
        onChildSpace={handleChildSpace}
        onParentSpace={handleParentSpace}
      />
      
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Patou — Protéger • Partager • Éveiller
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm">
            <a href="/privacy" className="text-gray-500 hover:text-green-600 transition-colors">
              Confidentialité
            </a>
            <a href="/terms" className="text-gray-500 hover:text-green-600 transition-colors">
              CGU
            </a>
            <a href="/contact" className="text-gray-500 hover:text-green-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}