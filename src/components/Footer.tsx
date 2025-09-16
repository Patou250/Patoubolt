import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/parent/dashboard', label: 'Dashboard' },
  { to: '/parent/curation',  label: 'Playlists' },
  { to: '/parent/rules/choose', label: 'Règles' },
  { to: '/parent/history',   label: 'Historique' },
  { to: '/parent/insights',  label: 'Insights' },
]

export default function Footer() {
  const { pathname } = useLocation()
  const isParent = pathname.startsWith('/parent')

  if (!isParent) return null

  return (
    <nav className="border-t border-white/10 bg-background/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-2 py-2 grid grid-cols-5 gap-1">
        {tabs.map(t => {
          const active = pathname.startsWith(t.to)
          return (
            <Link
              key={t.to}
              to={t.to}
              className={`text-center rounded-lg py-2 text-sm ${active ? 'bg-white/10 font-medium' : 'hover:bg-white/5'}`}
            >
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}