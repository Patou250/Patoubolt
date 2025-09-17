import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AppShell from './components/AppShell'
import Header from './components/Header'
import Footer from './components/Footer'
import Navigation from './components/Navigation' // ta nav mobile/desktop existante

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

export default function App() {
  return (
    <Router>
      <Header />
      <AppShell sidebar={<div className="hidden md:block"><Navigation /></div>}>
        <main className="pb-16 md:pb-0">
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
            {/* Enfant */}
            <Route path="/child/login" element={<ChildLogin />} />
            <Route path="/child" element={<Child />} />
            <Route path="/child/search" element={<ChildSearch />} />
            {/* Player */}
            <Route path="/player" element={<Player />} />
          </Routes>
        </main>
      </AppShell>
      {/* Bottom nav mobile en dehors d'AppShell pour coller au bas de l'écran */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40">
        <Navigation />
      </div>
      <Footer />
    </Router>
  )
}