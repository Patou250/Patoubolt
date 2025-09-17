import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img src="/logo.png" alt="Patou" className="w-32 h-32 mb-8" />
      <h1 className="text-2xl font-bold mb-6">Bienvenue sur Patou</h1>
      <div className="flex gap-6">
        <Link
          to="/parent/login"
          className="px-6 py-3 rounded-lg bg-black text-white font-medium"
        >
          Espace Parent
        </Link>
        <Link
          to="/child/login"
          className="px-6 py-3 rounded-lg bg-green-600 text-white font-medium"
        >
          Espace Enfant
        </Link>
      </div>
    </div>
  )
}