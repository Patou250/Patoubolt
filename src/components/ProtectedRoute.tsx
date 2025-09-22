import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getParentSession } from '../utils/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
  role: 'parent' | 'child'
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [role])

  const checkAuth = async () => {
    if (role === 'parent') {
      // Check Supabase auth first
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setIsAuthenticated(true)
        return
      }

      // Fallback to parent session
      const parentSession = getParentSession()
      if (parentSession) {
        setIsAuthenticated(true)
        return
      }

      // Not authenticated
      setIsAuthenticated(false)
      navigate('/parent/login')
    } else if (role === 'child') {
      // Check child session
      const childSession = localStorage.getItem('patou_child')
      if (childSession) {
        setIsAuthenticated(true)
        return
      }

      // Not authenticated
      setIsAuthenticated(false)
      navigate('/child/login')
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect handled in useEffect
  }

  return <>{children}</>
}