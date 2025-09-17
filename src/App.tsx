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
  console.log('🔀 NetlifyFunctionRedirect component rendered')
  console.log('🌐 Current pathname:', window.location.pathname)
  
  useEffect(() => {
    console.log('🔀 NetlifyFunctionRedirect useEffect triggered')
    // If we're on a Netlify function path, redirect immediately
    if (window.location.pathname.startsWith('/.netlify/functions/')) {
      console.log('✅ Detected Netlify function path, redirecting...')
      console.log('🔗 Redirecting to:', window.location.href)
      window.location.href = window.location.href
    } else {
      console.log('❌ Not a Netlify function path')
    }
  }, [])
  
  return null
}

export default function App() {
  console.log('🚀 App component rendered')
  console.log('🌐 Current pathname:', window.location.pathname)
  console.log('🌐 Full location:', window.location.href)
  console.log('🔍 Checking if Netlify function path...')
  
  // Check if current path is a Netlify function
  if (window.location.pathname.startsWith('/.netlify/functions/')) {
    console.log('🔀 Detected Netlify function path, using NetlifyFunctionRedirect')
    console.log('🔀 Path detected:', window.location.pathname)
    return <NetlifyFunctionRedirect />
  }

  console.log('📱 Using normal React Router')
  console.log('📱 Will render Router with routes')
  return (
    <Router>
      {console.log('📱 Router component rendering')}
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