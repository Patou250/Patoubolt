import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
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
    </Router>
  )
}