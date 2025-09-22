import { Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import ChildLayout from './layouts/ChildLayout'
import DesignSystemProvider from './components/ui/DesignSystemProvider'
import { usePreviewGate } from './hooks/usePreviewGate'
import PreviewGate from './components/PreviewGate'

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

// Import du composant de test pour les routes dev
import KonstaTest from './pages/_dev/KonstaTest'

export default function App() {
  const { mustGate } = usePreviewGate()

  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <DesignSystemProvider>
      <div className="min-h-screen bg-background-page">
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Parent */}
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