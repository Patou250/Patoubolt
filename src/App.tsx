import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import ParentCallback from './pages/ParentCallback'
import ParentLogin from './pages/ParentLogin'
import ParentDashboard from './pages/ParentDashboard'
import Player from './pages/Player'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import ChildPlaylists from './pages/ChildPlaylists'
import ChildHistory from './pages/ChildHistory'

// Component to handle Netlify function redirects
function NetlifyFunctionRedirect() {
  useEffect(() => {
    // If we're on a Netlify function path, redirect immediately
    if (window.location.pathname.startsWith('/.netlify/functions/')) {
      window.location.href = window.location.href
    }
  }, [])
  
  return null
}

export default function App() {
  // Check if current path is a Netlify function
  if (window.location.pathname.startsWith('/.netlify/functions/')) {
    return <NetlifyFunctionRedirect />
  }

  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/parent/callback" element={<ParentCallback />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/player" element={<Player />} />
          <Route path="/child/login" element={<ChildLogin />} />
          <Route path="/child" element={<Child />} />
          <Route path="/child/search" element={<ChildSearch />} />
          <Route path="/child/playlists" element={<ChildPlaylists />} />
          <Route path="/child/history" element={<ChildHistory />} />
        </Route>
      </Routes>
    </Router>
  )
}