import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer-patou">
      <div className="container-patou py-8">
        <div className="text-center">
        <p className="text-gray-500 text-sm mb-4">
          © 2025 Patou - Musique sécurisée pour enfants
        </p>
        <div className="flex justify-center gap-6 flex-wrap">
          <Link to="/cgu" className="text-gray-600 hover:text-protect text-sm transition-colors">
            Conditions Générales d'Utilisation
          </Link>
          <Link to="/cgv" className="text-gray-600 hover:text-protect text-sm transition-colors">
            Conditions Générales de Vente
          </Link>
          <Link to="/privacy" className="text-gray-600 hover:text-protect text-sm transition-colors">
            Politique de Confidentialité
          </Link>
          <Link to="/contact" className="text-gray-600 hover:text-protect text-sm transition-colors">
            Contact
          </Link>
        </div>
        </div>
      </div>
    </footer>
  )
}