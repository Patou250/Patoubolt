import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import PreviewGate from './components/PreviewGate'
import AppShell from './components/AppShell'
import { usePreviewGate } from './hooks/usePreviewGate'
import Home from './pages/Home'
import ParentLogin from './pages/ParentLogin'
import ParentCallback from './pages/ParentCallback'
import ParentDashboard from './pages/ParentDashboard'
import ParentChildren from './pages/ParentChildren'
import ParentRules from './pages/ParentRules'
import ParentCuration from './pages/ParentCuration'
import ParentInsights from './pages/ParentInsights'
import ParentHistory from './pages/ParentHistory'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'
import Player from './pages/Player'

function App() {
  const { mustGate } = usePreviewGate()
  
  if (mustGate) return <PreviewGate />

  return (
    <Router>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          {/* PAGES PARENT */}
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/callback" element={<ParentCallback />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/children" element={<ParentChildren />} />
          <Route path="/parent/rules/:childId" element={<ParentRules />} />
          <Route path="/parent/curation" element={<ParentCuration />} />
          <Route path="/parent/insights" element={<ParentInsights />} />
          <Route path="/parent/history" element={<ParentHistory />} />
          {/* PAGES ENFANT */}
          <Route path="/child/login" element={<ChildLogin />} />
          <Route path="/child" element={<Child />} />
          {/* PLAYER */}
          <Route path="/player" element={<Player />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App