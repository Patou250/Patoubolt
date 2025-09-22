import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { supabase } from './lib/supabase'
import PublicLayout from './layouts/PublicLayout'
import ChildLayout from './layouts/ChildLayout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import { usePreviewGate } from './hooks/usePreviewGate'
import PreviewGate from './components/PreviewGate'

// Public pages
import Home from './pages/Home'
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
  const { mustGate } = usePreviewGate()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    console.log('🚀 App mounted, current path:', location.pathname)
  }, [location.pathname])

  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={
            <PublicLayout>
              <Home />
            </PublicLayout>
          } />
          
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/signup" element={<ParentSignup />} />

          {/* Legacy public routes */}
          <Route path="/login-parent" element={<ParentLogin />} />
          <Route path="/signup-parent" element={<ParentSignup />} />

          {/* Protected parent routes */}
          <Route path="/parent/dashboard" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/parent/children" element={
            <ProtectedRoute role="parent">
              <ParentChildren />
            </ProtectedRoute>
          } />
          
          <Route path="/parent/curation" element={
            <ProtectedRoute role="parent">
              <ParentCuration />
            </ProtectedRoute>
          } />
          
          <Route path="/parent/settings" element={
            <ProtectedRoute role="parent">
              <ParentSettings />
            </ProtectedRoute>
          } />

          {/* Legacy parent routes */}
          <Route path="/dashboard-parent" element={
            <ProtectedRoute role="parent">
              <ParentDashboard />
            </ProtectedRoute>
          } />

          {/* Parent callback */}
          <Route path="/parent/callback" element={<ParentCallback />} />

          {/* Child routes */}
          <Route path="/child/login" element={<ChildLogin />} />
          
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

          {/* Other routes */}
          <Route path="/player" element={<Player />} />
          <Route path="/test/moderation" element={<TestModeration />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/patou-admin" element={<PatouAdmin />} />
          
          {/* Dev routes */}
          <Route path="/_dev/konsta" element={<KonstaTest />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}