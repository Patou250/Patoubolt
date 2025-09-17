import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import ParentLogin from './pages/ParentLogin'
import ParentCallback from './pages/ParentCallback'
import ParentChildren from './pages/ParentChildren'
import ParentDashboard from './pages/ParentDashboard'
import ParentSignup from './pages/ParentSignup'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import Player from './pages/Player'

export default function App() {
  return (
    <Router>
      <div className="flex">
        <Navigation />
        <main className="flex-1 min-h-screen pb-16 md:pb-0 px-4 md:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            {/* Parent */}
            <Route path="/parent/login" element={<ParentLogin />} />
            <Route path="/parent/callback" element={<ParentCallback />} />
            <Route path="/parent" element={<ParentDashboard />} />
            <Route path="/parent/signup" element={<ParentSignup />} />
            <Route path="/parent/settings" element={<ParentDashboard />} />
            <Route path="/parent/children" element={<ParentChildren />} />
            <Route path="/parent/dashboard" element={<ParentDashboard />} />
            {/* Routes d'accès direct pour tests */}
            <Route path="/direct/parent" element={<ParentDashboard />} />
            <Route path="/direct/child" element={<Child />} />
            {/* Enfant */}
            <Route path="/child/login" element={<ChildLogin />} />
            <Route path="/child" element={<Child />} />
            <Route path="/child/search" element={<ChildSearch />} />
            {/* Player */}
            <Route path="/player" element={<Player />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}