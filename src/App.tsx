import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Navigation from './components/Navigation'
import ChildLayout from './layouts/ChildLayout'
import DesignSystemProvider from './components/ui/DesignSystemProvider'
import { usePreviewGate } from './hooks/usePreviewGate'
import PreviewGate from './components/PreviewGate'
import { initializePageContext } from './utils/pageContext'

// …imports pages
import Home from './pages/Home'
import ParentLogin from './pages/ParentLogin'
import ParentSignup from './pages/ParentSignup'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentCuration from './pages/ParentCuration'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import Player from './pages/Player'
import ParentCallback from './pages/ParentCallback'
import TestModeration from './pages/TestModeration'
import AdminModeration from './pages/AdminModeration'
import ChildFavorites from './pages/ChildFavorites'
import ChildPlaylists from './pages/ChildPlaylists'
import PatouAdmin from './pages/PatouAdmin'
import ParentSettings from './pages/ParentSettings'

// Import du composant de test pour les routes dev
import KonstaTest from './pages/_dev/KonstaTest'

export default function App() {
  const { mustGate, location } = usePreviewGate()

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

  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-background-page">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Parent */}
          <Route path="/login-parent" element={<ParentLogin />} />
          <Route path="/signup-parent" element={<ParentSignup />} />
          <Route path="/dashboard-parent" element={<ParentDashboard />} />
          {/* Legacy routes - redirect to new routes */}
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/signup" element={<ParentSignup />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/curation" element={<ParentCuration />} />
          <Route path="/parent/callback" element={<ParentCallback />} />
          {/* Routes d'accès direct pour tests */}
          <Route path="/direct/parent" element={<ParentDashboard />} />
          <Route path="/direct/child" element={<Child />} />
          {/* Routes de test et admin */}
          <Route path="/test/moderation" element={<TestModeration />} />
          <Route path="/admin/moderation" element={<AdminModeration />} />
          <Route path="/patou-admin" element={<PatouAdmin />} />
          {/* Dev routes */}
          <Route path="/_dev/konsta" element={<KonstaTest />} />
          
          {/* Child login - outside layout */}
          <Route path="/login-enfant" element={<ChildLogin />} />
          {/* Legacy route */}
          <Route path="/child/login" element={<ChildLogin />} />
          
          {/* Child routes - all under ChildLayout */}
          <Route path="/child" element={<ChildLayout />}>
            <Route index element={<Child />} />
            <Route path="favorites" element={<ChildFavorites />} />
            <Route path="playlists" element={<ChildPlaylists />} />
            <Route path="playlists/:id" element={<ChildPlaylists />} />
            <Route path="search" element={<ChildSearch />} />
          </Route>
          
          {/* Player */}
          <Route path="/player" element={<Player />} />
        </Routes>
      </div>
    </DesignSystemProvider>
  )
}