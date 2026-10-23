import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import HalloweenHackPage from './components/event/HalloweenHackPage.jsx'

function RoutedApp() {
  const [path, setPath] = useState(() => (typeof window !== 'undefined' ? window.location.pathname : '/'))

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname)
    }

    window.addEventListener('popstate', handleLocationChange)

    // Smooth client-side SPA navigation for internal links
    const handleLinkClick = (e) => {
      const anchor = e.target.closest('a')
      if (
        anchor &&
        anchor.origin === window.location.origin &&
        !anchor.target &&
        !anchor.hasAttribute('download') &&
        !anchor.getAttribute('href')?.startsWith('#') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const destPath = anchor.pathname
        if (destPath) {
          e.preventDefault()
          window.history.pushState({}, '', anchor.href)
          setPath(destPath)
          window.scrollTo(0, 0)
        }
      }
    }

    document.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('popstate', handleLocationChange)
      document.removeEventListener('click', handleLinkClick)
    }
  }, [])

  const normalized = path.toLowerCase().replace(/\/+$/, '') || '/'

  // Support /halloween-hack as primary route, plus common aliases
  if (
    normalized === '/halloween-hack' ||
    normalized === '/halloween' ||
    normalized === '/hackathon' ||
    normalized === '/hack-o-lantern'
  ) {
    return <HalloweenHackPage />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RoutedApp />
  </StrictMode>,
)
