export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-patou-main-50 to-protect-50 border-t border-gray-200/50 mt-auto">
      <div className="container">
        <div className="py-12">
          <div className="bento-grid-4">
            <div className="bento-card bento-card--primary">
              <div className="flex items-center mb-4">
                <img 
                  src="/Patou emeraude sans fond.png" 
                  alt="Patou Logo" 
                  className="h-5 w-auto mr-3"
                />
                <h3 className="text-lg font-bold text-patou">Patou</h3>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                La solution de contrôle parental musical qui protège, partage et éveille.
              </p>
            </div>
            
            <div className="bento-card">
              <h4 className="font-semibold text-gray-900 mb-3">Fonctionnalités</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>🛡️ Contrôle parental</li>
                <li>🎵 Playlists sécurisées</li>
                <li>📊 Statistiques d'écoute</li>
                <li>⏰ Gestion du temps</li>
              </ul>
            </div>
            
            <div className="bento-card">
              <h4 className="font-semibold text-gray-900 mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📧 Contact</li>
                <li>❓ FAQ</li>
                <li>📖 Guide d'utilisation</li>
                <li>🔧 Assistance technique</li>
              </ul>
            </div>
            
            <div className="bento-card">
              <h4 className="font-semibold text-gray-900 mb-3">Légal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>📋 Conditions d'utilisation</li>
                <li>🔒 Politique de confidentialité</li>
                <li>🍪 Cookies</li>
                <li>⚖️ Mentions légales</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200/50 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <p className="text-sm text-gray-500">
                © 2025 Patou - Musique sécurisée pour enfants
              </p>
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-patou-main rounded-full"></div>
                  <span className="text-xs text-gray-500">Protéger</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-protect rounded-full"></div>
                  <span className="text-xs text-gray-500">Partager</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-awaken rounded-full"></div>
                  <span className="text-xs text-gray-500">Éveiller</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}