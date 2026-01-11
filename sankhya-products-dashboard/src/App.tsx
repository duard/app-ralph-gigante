import { BrowserRouter as Router } from 'react-router-dom'
import { AppLayout } from '@/components/layouts/app-layout'
import { AppRouter } from '@/components/router/app-router'
import { ErrorBoundary } from '@/components/ui/error-boundary'
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
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.error('App-level error:', error, errorInfo)
        }
        
        // In production, you might send to error reporting service
        if (process.env.NODE_ENV === 'production') {
          // Example: errorReportingService.captureException(error, { extra: errorInfo })
          console.warn('Production app error:', error.message)
        }
      }}
    >
      <AppLayout>
        <Router basename={basename}>
          <AppRouter />
        </Router>
      </AppLayout>
    </ErrorBoundary>
  )
}

export default App
