import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Users, User } from 'lucide-react'
import { isParentAuthenticated, isChildAuthenticated } from '../utils/auth'

export function Header() {
  const location = useLocation()
  const parentAuth = isParentAuthenticated()
  const childAuth = isChildAuthenticated()
  
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50">
      <div className="container">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-3 group">
            <img 
              src="/Patou emeraude sans fond.png" 
              alt="Patou Logo" 
              className="h-6 w-auto group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-patou">Patou</span>
              <span className="text-xs text-gray-500 -mt-1">Musique familiale</span>
            </div>
          </Link>
          
          <nav className="flex items-center space-x-4">
            {!parentAuth && !childAuth && (
              <>
                <Link
                  to="/parent/login"
                  className="btn btn--protect"
                >
                  <Users className="w-4 h-4" />
                  Parent
                </Link>
                <Link
                  to="/child/login"
                  className="btn btn--share"
                >
                  <User className="w-4 h-4" />
                  Enfant
                </Link>
              </>
            )}
            
            {parentAuth && (
              <Link
                to="/parent/dashboard"
                className="btn btn--protect"
              >
                <Users className="w-4 h-4" />
                Dashboard
              </Link>
            )}
            
            {childAuth && (
              <Link
                to="/child"
                className="btn btn--share"
              >
                <User className="w-4 h-4" />
                Lecteur
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}