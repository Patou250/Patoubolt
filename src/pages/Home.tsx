import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { getParentSession } from '../utils/auth'
import { getSpotifyTokens } from '../utils/spotify-tokens'
import { usePreviewGate } from '../hooks/usePreviewGate'
import PreviewGate from '../components/PreviewGate'

export default function Home() {
  const navigate = useNavigate()
  const { mustGate } = usePreviewGate()

  // Afficher le gate de prévisualisation si nécessaire
  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-6">Patou</h1>
      <div className="flex gap-4">
        {/* Ouvre la connexion parent, PAS Spotify */}
        <Link to="/parent/login" className="px-6 py-3 bg-black text-white rounded">
          Espace parent
        </Link>
        <Link to="/child/login" className="px-6 py-3 bg-green-600 text-white rounded">
          Espace enfant
        </Link>
      </div>
    </div>
  )
}