import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import ParentCallback from './pages/ParentCallback'
import ParentLogin from './pages/ParentLogin'
import ParentDashboard from './pages/ParentDashboard'
import ParentHistory from './pages/ParentHistory'
import ParentExcluded from './pages/ParentExcluded'
import ParentInsights from './pages/ParentInsights'
import ParentPlayer from './pages/ParentPlayer'
import Player from './pages/Player'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import ChildSearch from './pages/ChildSearch'
import ChildPlaylists from './pages/ChildPlaylists'
import ChildHistory from './pages/ChildHistory'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/parent/callback" element={<ParentCallback />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/history" element={<ParentHistory />} />
          <Route path="/parent/excluded" element={<ParentExcluded />} />
          <Route path="/parent/insights" element={<ParentInsights />} />
          <Route path="/parent/player" element={<ParentPlayer />} />
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