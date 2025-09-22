import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'

// Pages
import Home from './pages/Home'
import ParentLogin from './pages/ParentLogin'
import ParentSignup from './pages/ParentSignup'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentCallback from './pages/ParentCallback'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import ChildFavorites from './pages/ChildFavorites'

// Components
import { usePreviewGate } from './hooks/usePreviewGate'
import PreviewGate from './components/PreviewGate'

export default function App() {
  const { mustGate } = usePreviewGate()

  useEffect(() => {
    console.log('🚀 App started, path:', window.location.pathname)
  }, [])

  if (mustGate) {
    return <PreviewGate />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/parent/login" element={<ParentLogin />} />
        <Route path="/parent/signup" element={<ParentSignup />} />
        <Route path="/login-parent" element={<ParentLogin />} />
        <Route path="/signup-parent" element={<ParentSignup />} />
        
        {/* Parent routes */}
        <Route path="/parent/dashboard" element={<ParentDashboard />} />
        <Route path="/dashboard-parent" element={<ParentDashboard />} />
        <Route path="/parent/children" element={<ParentChildren />} />
        <Route path="/parent/callback" element={<ParentCallback />} />
        
        {/* Child routes */}
        <Route path="/child/login" element={<ChildLogin />} />
        <Route path="/login-enfant" element={<ChildLogin />} />
        <Route path="/child" element={<Child />} />
        <Route path="/child/search" element={<ChildSearch />} />
        <Route path="/child/favorites" element={<ChildFavorites />} />
      </Routes>
    </div>
  )
}