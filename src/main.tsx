import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from 'react-router-dom'
import App from './App.tsx'
import { initializeDesignSystem } from './utils/designSystem'
import './index.css'
import './styles/lovable-design-system.css'
import './styles/theme.css'
import './styles/app.css'

// Initialize design system before rendering
const startApp = async () => {
  console.log('🚀 Starting Patou application...')
  
  try {
    // Initialize WeWeb design system
    await initializeDesignSystem()
    
    // Render React app
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>,
    )
    
    console.log('✅ Patou application started successfully')
  } catch (error) {
    console.error('❌ Failed to start application:', error)
    
    // Render app anyway with fallback design system
    ReactDOM.createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <Router>
          <App />
        </Router>
      </React.StrictMode>,
    )
  }
}

startApp()