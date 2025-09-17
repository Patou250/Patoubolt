import { Link } from 'react-router-dom'
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-4xl font-extrabold mb-6">Patou</h1>
      <div className="flex gap-4">
        <Link to="/parent/login" className="px-6 py-3 bg-black text-white rounded">Espace parent</Link>
        <Link to="/child/login" className="px-6 py-3 bg-green-600 text-white rounded">Espace enfant</Link>
      </div>
    </div>
  )
}