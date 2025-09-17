import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="patou-footer">
      <div className="patou-footer-content">
        <p className="patou-footer-text">
          © 2025 Patou - Musique sécurisée pour enfants
        </p>
        <div className="patou-footer-links">
          <Link to="/cgu" className="patou-footer-link">
            Conditions Générales d'Utilisation
          </Link>
          <Link to="/cgv" className="patou-footer-link">
            Conditions Générales de Vente
          </Link>
          <Link to="/privacy" className="patou-footer-link">
            Politique de Confidentialité
          </Link>
          <Link to="/contact" className="patou-footer-link">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  )
}