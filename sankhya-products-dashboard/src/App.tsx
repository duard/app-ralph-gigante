import { AppLayout } from '@/components/layouts/app-layout';
import { AppRouter } from '@/components/router/app-router';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { QueryProvider } from '@/lib/react-query';
import { initGTM } from '@/utils/analytics';
import { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

// Get basename from environment (for deployment) or use empty string for development
const basename = import.meta.env.VITE_BASENAME || '';

function App() {
  // Initialize services on app load
  useEffect(() => {
    initGTM();

    // TODO: Fix route preloader - currently causing 404 errors in development
    // initializeRoutePreloader();
  }, []);

  return (
    <QueryProvider>
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Log to console in development
          if (process.env.NODE_ENV === 'development') {
            console.error('App-level error:', error, errorInfo);
          }

          // In production, you might send to error reporting service
          if (process.env.NODE_ENV === 'production') {
            // Example: errorReportingService.captureException(error, { extra: errorInfo })
            console.warn('Production app error:', error.message);
          }
        }}
      >
        <AppLayout>
          <Router basename={basename}>
            <AppRouter />
          </Router>
        </AppLayout>

        {/* Code splitting debug component - only in development */}
        {/* <CodeSplittingDebug /> */}
      </ErrorBoundary>
    </QueryProvider>
  );
}

export default App;
