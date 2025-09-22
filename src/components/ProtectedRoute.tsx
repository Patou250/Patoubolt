import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

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
    console.log('🔐 Checking authentication for role:', role)
    
    if (role === 'parent') {
      // Vérifier auth Supabase d'abord
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log('✅ Supabase user authenticated:', user.email)
        setIsAuthenticated(true)
        return
      }

      // Fallback: vérifier session localStorage
      const parentSession = localStorage.getItem('patou_parent_session')
      if (parentSession) {
        try {
          const session = JSON.parse(parentSession)
          // Vérifier que la session n'est pas trop ancienne (24h)
          if (Date.now() - session.timestamp < 24 * 60 * 60 * 1000) {
            console.log('✅ Valid parent session found:', session.parent.email)
            setIsAuthenticated(true)
            return
          } else {
            console.log('⏰ Parent session expired')
            localStorage.removeItem('patou_parent_session')
          }
        } catch (error) {
          console.error('❌ Error parsing parent session:', error)
          localStorage.removeItem('patou_parent_session')
        }
      }

      // Non authentifié
      console.log('❌ Parent not authenticated, redirecting to login')
      setIsAuthenticated(false)
      navigate('/parent/login')
      
    } else if (role === 'child') {
      // Vérifier session enfant
      const childSession = localStorage.getItem('patou_child_session')
      if (childSession) {
        try {
          const session = JSON.parse(childSession)
          console.log('✅ Valid child session found:', session.child?.name || session.name)
          setIsAuthenticated(true)
          return
        } catch (error) {
          console.error('❌ Error parsing child session:', error)
          localStorage.removeItem('patou_child_session')
        }
      }

      // Non authentifié
      console.log('❌ Child not authenticated, redirecting to login')
      setIsAuthenticated(false)
      navigate('/child/login')
    }
  }

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Vérification de l'authentification...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Redirect handled in useEffect
  }

  return <>{children}</>
}