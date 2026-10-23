import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import HalloweenHackPage from './components/event/HalloweenHackPage.jsx'

function RoutedApp() {
  if (window.location.pathname === '/halloween-hack') {
    return <HalloweenHackPage />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
)
