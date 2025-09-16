import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      {/* Logo + baseline */}
      <div className="flex items-center justify-center mb-8">
        <img src="/Patou emeraude sans fond.png" alt="Patou" className="h-14 mr-3" />
        <h1 className="text-2xl font-semibold">Patou — protéger, partager, inspirer</h1>
      </div>

      {/* Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Bento to="/child/login" title="Espace Enfant" desc="Écouter, liker, découvrir" />
        <Bento to="/parent/dashboard" title="Tableau de bord" desc="Vue famille & activités" />
        <Bento to="/parent/curation" title="Playlists" desc="Curation & hebdo (10 titres)" />
        <Bento to="/parent/rules/choose" title="Règles" desc="Plages horaires & filtres" />
        <Bento to="/parent/history" title="Historique" desc="Écoutes & favoris" />
        <Bento to="/parent/insights" title="Insights" desc="Usage & conversion" />
      </div>

      {/* CTA bêta */}
      <div className="text-center mt-10">
        <Link
          to="/parent/login"
          className="inline-block rounded-xl px-5 py-3 bg-emerald-600 text-white font-medium hover:bg-emerald-700"
        >
          Commencer la bêta
        </Link>
      </div>
    </div>
  )
}

function Bento({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link
      to={to}
      className="rounded-2xl p-5 bg-white/5 border border-white/10 hover:border-white/20 transition
                 shadow-sm hover:shadow-md min-h-[140px] flex flex-col justify-between"
    >
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-sm text-white/70">{desc}</div>
    </Link>
  )
}