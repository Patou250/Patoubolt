export default function Child() {
  const data = localStorage.getItem('patou_child')
  const child = data ? JSON.parse(data) : null

  if (!child) {
    return (
      <div className="text-center">
        <p className="mb-4">Aucun profil enfant. </p>
        <a href="/child/login" className="px-4 py-2 rounded-lg bg-black text-white">Créer un profil</a>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto text-center">
      <h1 className="text-xl font-semibold mb-2">Bonjour {child.name} 👋</h1>
      <p className="text-gray-600 mb-6">Tu peux écouter la musique de Patou.</p>
      <a href="/player" className="px-5 py-3 rounded-lg bg-black text-white inline-block">Ouvrir le lecteur</a>
    </div>
  )
}