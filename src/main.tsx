import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import AppShell from './components/ui/AppShell'
import { PatouAssetPreloader } from './components/ui/AssetPreloader'
import './index.css'
import './styles/theme.css'
import './styles/app.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PatouAssetPreloader />
    <Router>
      <AppShell>
        <App />
      </AppShell>
    </Router>
  </React.StrictMode>,
)