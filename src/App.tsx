import { Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import PublicLayout from './layouts/PublicLayout'
import AppLayout from './layouts/AppLayout'
import ChildLayout from './layouts/ChildLayout'
import ProtectedRoute from './components/ProtectedRoute'
import DesignSystemProvider from './components/ui/DesignSystemProvider'
import { usePreviewGate } from './hooks/usePreviewGate'
import PreviewGate from './components/PreviewGate'
import { initializePageContext } from './utils/pageContext'

// Public pages (Lovable UI)
import Home from './pages/public/Home'
import ParentLogin from './pages/public/ParentLogin'
import ParentSignup from './pages/public/ParentSignup'

// Protected pages
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentCuration from './pages/ParentCuration'
import ParentSettings from './pages/ParentSettings'
import ParentCallback from './pages/ParentCallback'

// Child pages
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import ChildFavorites from './pages/ChildFavorites'
import ChildPlaylists from './pages/ChildPlaylists'

// Other pages
import Player from './pages/Player'
import TestModeration from './pages/TestModeration'
import AdminModeration from './pages/AdminModeration'
import PatouAdmin from './pages/PatouAdmin'

// Dev pages
import KonstaTest from './pages/_dev/KonstaTest'

export default function App() {
  const { mustGate, location } = usePreviewGate()
  const navigate = useNavigate()

  // Apply page-specific styles on route change
  useEffect(() => {
    const applyPageStyles = async () => {
      try {
        await initializePageContext(location.pathname)
      } catch (error) {
        console.error('❌ Error applying page styles:', error)
      }
    }

    applyPageStyles()
  }, [location.pathname])

  if (mustGate) {
    return <PreviewGate />
  }

  // Navigation handlers for public pages
  const handleLogin = () => navigate('/parent/login')
  const handleSignup = () => navigate('/parent/signup')
  const handleChildSpace = () => navigate('/child/login')
  const handleParentSpace = () => navigate('/parent/login')

  // Auth handlers
  const handleParentLogin = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    navigate('/parent/dashboard')
  }

  const handleParentSignup = async (data: any) => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: undefined,
        data: {
          full_name: `${data.firstName} ${data.lastName}`,
          first_name: data.firstName,
          last_name: data.lastName,
          birthdate: data.birthdate
        }
      }
    })
    if (error) throw error
    navigate('/parent/login')
  }

  return (
    <DesignSystemProvider>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes with PublicLayout */}
          <Route path="/" element={
            <PublicLayout>
              <Home 
                onLogin={handleLogin}
                onSignup={handleSignup}
                onChildSpace={handleChildSpace}
                onParentSpace={handleParentSpace}
              />
            </PublicLayout>
          } />
          
          <Route path="/parent/login" element={
            <PublicLayout>
              <ParentLogin onSubmit={handleParentLogin} />
            </PublicLayout>
          } />
          
          <Route path="/parent/signup" element={
            <PublicLayout>
              <ParentSignup onSubmit={handleParentSignup} />
            </PublicLayout>
          } />

          {/* Legacy public routes */}
          <Route path="/login-parent" element={
            <PublicLayout>
              <ParentLogin onSubmit={handleParentLogin} />
            </PublicLayout>
          } />
          
          <Route path="/signup-parent" element={
            <PublicLayout>
              <ParentSignup onSubmit={handleParentSignup} />
            </PublicLayout>
          } />

          {/* Protected parent routes with AppLayout */}
          <Route path="/parent/dashboard" element={
            <ProtectedRoute role="parent">
              <AppLayout userType="parent">
                <ParentDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/parent/children" element={
            <ProtectedRoute role="parent">
              <AppLayout userType="parent">
                <ParentChildren />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/parent/curation" element={
            <ProtectedRoute role="parent">
              <AppLayout userType="parent">
                <ParentCuration />
              </AppLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/parent/settings" element={
            <ProtectedRoute role="parent">
              <AppLayout userType="parent">
                <ParentSettings />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Legacy parent routes */}
          <Route path="/dashboard-parent" element={
            <ProtectedRoute role="parent">
              <AppLayout userType="parent">
                <ParentDashboard />
              </AppLayout>
            </ProtectedRoute>
          } />

          {/* Parent callback (no layout needed) */}
          <Route path="/parent/callback" element={<ParentCallback />} />

          {/* Child login (no layout) */}
          <Route path="/child/login" element={<ChildLogin />} />
          <Route path="/login-enfant" element={<ChildLogin />} />
          
          {/* Protected child routes with ChildLayout */}
          <Route path="/child" element={
            <ProtectedRoute role="child">
              <ChildLayout>
                <Child />
              </ChildLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/child/favorites" element={
            <ProtectedRoute role="child">
              <ChildLayout>
                <ChildFavorites />
              </ChildLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/child/playlists" element={
            <ProtectedRoute role="child">
              <ChildLayout>
                <ChildPlaylists />
              </ChildLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/child/playlists/:id" element={
            <ProtectedRoute role="child">
              <ChildLayout>
                <ChildPlaylists />
              </ChildLayout>
            </ProtectedRoute>
          } />
          
          <Route path="/child/search" element={
            <ProtectedRoute role="child">
              <ChildLayout>
                <ChildSearch />
              </ChildLayout>
            </ProtectedRoute>
          } />

          {/* Direct access routes for testing */}
          <Route path="/direct/parent" element={<ParentDashboard />} />
          <Route path="/direct/child" element={<Child />} />
          
          {/* Other routes */}
          <Route path="/player" element={<Player />} />
          <Route path="/test/moderation" element={<TestModeration />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/patou-admin" element={<PatouAdmin />} />
          
          {/* Dev routes */}
          <Route path="/_dev/konsta" element={<KonstaTest />} />
        </Routes>
      </div>
    </DesignSystemProvider>
  )
}