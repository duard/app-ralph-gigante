'use client';

import { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { routes, type RouteConfig } from '@/config/routes';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { PageTransition } from '@/components/ui/page-transition';

function renderRoutes(routeConfigs: RouteConfig[]) {
  return routeConfigs.map((route, index) => (
    <Route
      key={route.path + index}
      path={route.path}
      element={
        <ErrorBoundary
          onError={(error, errorInfo) => {
            console.error(`Route error in ${route.path}:`, error, errorInfo);
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            <PageTransition>{route.element}</PageTransition>
          </Suspense>
        </ErrorBoundary>
      }
    >
      {route.children && renderRoutes(route.children)}
    </Route>
  ));
}

function AppRouterContent() {
  const location = useLocation();

  return <Routes location={location}>{renderRoutes(routes)}</Routes>;
}

export function AppRouter() {
  return <AppRouterContent />;
}
