import { useState } from 'react';

const PREVIEW_PASS = import.meta.env.VITE_PREVIEW_PASS as string | undefined;

export default function PreviewGate() {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (PREVIEW_PASS && value === PREVIEW_PASS) {
      localStorage.setItem('patou_preview_ok','1');
      location.reload();
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{
      background: 'linear-gradient(135deg, #f0f9f1 0%, #f0f9ff 50%, #fefce8 100%)'
    }}>
      {/* Message d'annonce en haut */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl px-4">
        <div className="bento-card bento-highlight text-center shadow-2xl">
          <div className="text-3xl font-bold mb-3">🎉 Patou arrive !!</div>
          <div className="text-lg">
            Rdv sur{' '}
            <a 
              href="https://join.patou.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-semibold hover:text-awaken-200 transition-colors"
            >
              join.patou.app
            </a>
            {' '}pour en savoir plus.
          </div>
        </div>
      </div>

      <div className="w-full max-w-md">
        <div className="bento-card text-center">
          <div className="mb-8">
            <img 
              src="/patou-logo.svg" 
              alt="Patou Logo" 
              className="h-16 w-auto mx-auto mb-4"
            />
            <div className="text-xl text-gray-600 mb-2">Musique sécurisée pour enfants</div>
            <div className="text-gray-500">Accès privé — version en préparation</div>
          </div>
          
          <form onSubmit={onSubmit} className="space-y-6">
            <input
              type="password"
              placeholder="Mot de passe"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-full border-2 border-gray-200 rounded-2xl px-6 py-4 outline-none focus:border-patou-main focus:ring-4 focus:ring-patou-main/20 transition-all text-lg"
              autoFocus
            />
            {error && <div className="text-sm text-share bg-share-50 p-3 rounded-xl">{error}</div>}
            <button 
              type="submit" 
              className="btn btn--primary btn--large w-full"
            >
              Entrer
            </button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-400">
            © Patou — Bêta privée
          </div>
        </div>
      </div>
    </div>
  );
}