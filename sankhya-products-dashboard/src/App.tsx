import { BrowserRouter as Router } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/app-layout'
import { AppRouter } from '@/components/router/app-router'
import { useEffect } from 'react'
import { initGTM } from '@/utils/analytics'

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || ''

function App() {
  // Initialize GTM on app load
  useEffect(() => {
    initGTM();
  }, []);

  return (
    <AppLayout>
      <Router basename={basename}>
        <AppRouter />
      </Router>
    </AppLayout>
  )
}

export default App
