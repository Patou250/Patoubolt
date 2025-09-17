import { NavLink } from 'react-router-dom'
import { Home, Music, Heart, Settings } from 'lucide-react'

function NavItem({ to, icon:Icon, label }: {to:string; icon:any; label:string}) {
  return (
    <NavLink
      to={to}
      className={({isActive}) => isActive ? 'nav-item-active' : 'nav-item-inactive'}
    >
      <Icon className="w-5 h-5" />
      <span className="hidden lg:inline">{label}</span>
    </NavLink>
  )
}

export default function Navigation(){
  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:shrink-0 border-r border-gray-100 bg-white min-h-screen px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="font-extrabold text-primary text-lg">Patou</span>
        </div>
        <nav className="flex flex-col gap-1">
          <NavItem to="/" icon={Home} label="Accueil" />
          <NavItem to="/child" icon={Music} label="Player enfant" />
          <NavItem to="/child/favorites" icon={Heart} label="Favoris" />
          <NavItem to="/parent/settings" icon={Settings} label="Réglages" />
        </nav>

        {/* section parent accentuée "Protéger" */}
        <div className="mt-8">
          <div className="text-xs uppercase tracking-wide text-gray-400 mb-2">Parent</div>
          <NavLink to="/parent/dashboard"
            className="nav-parent-active text-sm">
            Dashboard parent
          </NavLink>
        </div>
      </aside>

      {/* Bottom nav mobile */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-header safe-area-pb">
        <ul className="grid grid-cols-4">
          <li><NavLink to="/" className={({isActive}) => `flex flex-col items-center py-3 px-2 transition-colors duration-200 ${isActive?'text-primary':'text-gray-500 hover:text-gray-700'}`}>
            <Home className="w-5 h-5" /><span className="text-xs">Home</span>
          </NavLink></li>
          <li><NavLink to="/child" className={({isActive}) => `flex flex-col items-center py-3 px-2 transition-colors duration-200 ${isActive?'text-awaken':'text-gray-500 hover:text-gray-700'}`}>
            <Music className="w-5 h-5" /><span className="text-xs">Player</span>
          </NavLink></li>
          <li><NavLink to="/child/favorites" className={({isActive}) => `flex flex-col items-center py-3 px-2 transition-colors duration-200 ${isActive?'text-share':'text-gray-500 hover:text-gray-700'}`}>
            <Heart className="w-5 h-5" /><span className="text-xs">Favoris</span>
          </NavLink></li>
          <li><NavLink to="/parent/settings" className={({isActive}) => `flex flex-col items-center py-3 px-2 transition-colors duration-200 ${isActive?'text-protect':'text-gray-500 hover:text-gray-700'}`}>
            <Settings className="w-5 h-5" /><span className="text-xs">Réglages</span>
          </NavLink></li>
        </ul>
      </nav>
    </>
  )
}