import { Link, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/parent/dashboard', label: 'Dashboard' },
  { to: '/parent/curation',  label: 'Playlists' },
  { to: '/parent/children', label: 'Règles' },
  { to: '/parent/history',   label: 'Historique' },
  { to: '/parent/insights',  label: 'Insights' },
]

export default function Footer() {
  const { pathname } = useLocation()
  const isParent = pathname.startsWith('/parent')

  if (!isParent) return null

  return (
    <nav className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-2 py-2 grid grid-cols-5 gap-1">
        {tabs.map(tab => {
          const isActive = pathname.startsWith(tab.to)
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={`text-center rounded-lg py-3 px-2 text-sm font-medium transition-colors min-h-[44px] flex items-center justify-center ${
                isActive 
                  ? 'bg-emerald-100 text-emerald-700' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}