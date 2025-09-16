import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Home from './pages/Home'
import ParentCallback from './pages/ParentCallback'
import ParentLogin from './pages/ParentLogin'
import ParentDashboard from './pages/ParentDashboard'
import Player from './pages/Player'
import ChildLogin from './pages/ChildLogin'
import Child from './pages/Child'

export default function App() {
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
        </Route>
      </Routes>
    </Router>
  )
}