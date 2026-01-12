import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { PublicLayout } from '@/components/layouts/public-layout';
import { ProtectedRoute } from '@/components/auth/protected-route';

// Lazy load components with code splitting for better performance
// Main application routes - grouped into logical chunks

// Core dashboard and landing pages
const Landing = lazy(() => import(/* webpackChunkName: "landing" */ '@/app/landing/page'));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/app/dashboard/page'));
const Dashboard2 = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/app/dashboard-2/page'));
const BemVindo = lazy(() => import(/* webpackChunkName: "dashboard" */ '@/app/bem-vindo/page'));

// Main application features
const Produtos = lazy(() => import(/* webpackChunkName: "produtos" */ '@/app/produtos/page'));
const ProdutoDetalhes = lazy(() => import(/* webpackChunkName: "produtos" */ '@/app/produtos/[codprod]/page'));
const ProdutoConsumo = lazy(() => import(/* webpackChunkName: "produtos" */ '@/app/produtos/[codprod]/consumo/page'));
const ProdutoConsumoV2 = lazy(() => import(/* webpackChunkName: "produtos" */ '@/app/produtos/[codprod]/consumo-v2/page'));
const ProdutoConsumoV3 = lazy(() => import(/* webpackChunkName: "produtos" */ '@/app/produtos/[codprod]/consumo-v3/page'));
const Mail = lazy(() => import(/* webpackChunkName: "communication" */ '@/app/mail/page'));
const Chat = lazy(() => import(/* webpackChunkName: "communication" */ '@/app/chat/page'));
const Calendar = lazy(() => import(/* webpackChunkName: "communication" */ '@/app/calendar/page'));
const Tasks = lazy(() => import(/* webpackChunkName: "tasks" */ '@/app/tasks/page'));

// Content and user management
const Users = lazy(() => import(/* webpackChunkName: "users" */ '@/app/users/page'));
const FAQs = lazy(() => import(/* webpackChunkName: "content" */ '@/app/faqs/page'));
const Pricing = lazy(() => import(/* webpackChunkName: "content" */ '@/app/pricing/page'));
const InspectQuery = lazy(() => import(/* webpackChunkName: "tools" */ '@/app/inspect-query/page'));

// Authentication pages - grouped in auth chunk
const SignIn = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-in/page'));
const SignIn2 = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-in-2/page'));
const SignIn3 = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-in-3/page'));
const SignUp = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-up/page'));
const SignUp2 = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-up-2/page'));
const SignUp3 = lazy(() => import(/* webpackChunkName: "auth" */ '@/app/auth/sign-up-3/page'));
const ForgotPassword = lazy(
  () => import(/* webpackChunkName: "auth" */ '@/app/auth/forgot-password/page')
);
const ForgotPassword2 = lazy(
  () => import(/* webpackChunkName: "auth" */ '@/app/auth/forgot-password-2/page')
);
const ForgotPassword3 = lazy(
  () => import(/* webpackChunkName: "auth" */ '@/app/auth/forgot-password-3/page')
);

// Error pages - grouped in errors chunk
const Unauthorized = lazy(
  () => import(/* webpackChunkName: "errors" */ '@/app/errors/unauthorized/page')
);
const Forbidden = lazy(
  () => import(/* webpackChunkName: "errors" */ '@/app/errors/forbidden/page')
);
const NotFound = lazy(() => import(/* webpackChunkName: "errors" */ '@/app/errors/not-found/page'));
const InternalServerError = lazy(
  () => import(/* webpackChunkName: "errors" */ '@/app/errors/internal-server-error/page')
);
const UnderMaintenance = lazy(
  () => import(/* webpackChunkName: "errors" */ '@/app/errors/under-maintenance/page')
);

// Settings pages - grouped in settings chunk
const UserSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/user/page')
);
const AccountSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/account/page')
);
const BillingSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/billing/page')
);
const AppearanceSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/appearance/page')
);
const NotificationSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/notifications/page')
);
const ConnectionSettings = lazy(
  () => import(/* webpackChunkName: "settings" */ '@/app/settings/connections/page')
);

export interface RouteConfig {
  path: string;
  element: React.ReactNode;
  children?: RouteConfig[];
}

export const routes: RouteConfig[] = [
  // Default route - redirect to dashboard
  // Use absolute path "/dashboard" for basename compatibility
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },

  // Bem-Vindo Page
  {
    path: '/bem-vindo',
    element: (
      <ProtectedRoute>
        <BemVindo />
      </ProtectedRoute>
    ),
  },

  // Landing Page
  {
    path: '/landing',
    element: (
      <PublicLayout>
        <Landing />
      </PublicLayout>
    ),
  },

  // Dashboard Routes
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard-2',
    element: (
      <ProtectedRoute>
        <Dashboard2 />
      </ProtectedRoute>
    ),
  },

  // Application Routes
  {
    path: '/mail',
    element: (
      <ProtectedRoute>
        <Mail />
      </ProtectedRoute>
    ),
  },
  {
    path: '/tasks',
    element: (
      <ProtectedRoute>
        <Tasks />
      </ProtectedRoute>
    ),
  },
  {
    path: '/chat',
    element: (
      <ProtectedRoute>
        <Chat />
      </ProtectedRoute>
    ),
  },
  {
    path: '/calendar',
    element: (
      <ProtectedRoute>
        <Calendar />
      </ProtectedRoute>
    ),
  },
  {
    path: '/produtos',
    element: (
      <ProtectedRoute>
        <Produtos />
      </ProtectedRoute>
    ),
  },
  {
    path: '/produtos/:codprod',
    element: (
      <ProtectedRoute>
        <ProdutoDetalhes />
      </ProtectedRoute>
    ),
  },
  {
    path: '/produtos/:codprod/consumo',
    element: (
      <ProtectedRoute>
        <ProdutoConsumo />
      </ProtectedRoute>
    ),
  },
  {
    path: '/produtos/:codprod/consumo-v2',
    element: (
      <ProtectedRoute>
        <ProdutoConsumoV2 />
      </ProtectedRoute>
    ),
  },
  {
    path: '/produtos/:codprod/consumo-v3',
    element: (
      <ProtectedRoute>
        <ProdutoConsumoV3 />
      </ProtectedRoute>
    ),
  },

  // Content Pages
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <Users />
      </ProtectedRoute>
    ),
  },
  {
    path: '/faqs',
    element: (
      <ProtectedRoute>
        <FAQs />
      </ProtectedRoute>
    ),
  },
  {
    path: '/pricing',
    element: (
      <ProtectedRoute>
        <Pricing />
      </ProtectedRoute>
    ),
  },
  {
    path: '/inspect-query',
    element: (
      <ProtectedRoute>
        <InspectQuery />
      </ProtectedRoute>
    ),
  },

  // Authentication Routes
  {
    path: '/auth/entrar',
    element: (
      <PublicLayout>
        <SignIn />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/sign-in-2',
    element: (
      <PublicLayout>
        <SignIn2 />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/sign-in-3',
    element: (
      <PublicLayout>
        <SignIn3 />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/sign-up',
    element: (
      <PublicLayout>
        <SignUp />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/sign-up-2',
    element: (
      <PublicLayout>
        <SignUp2 />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/sign-up-3',
    element: (
      <PublicLayout>
        <SignUp3 />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/forgot-password',
    element: (
      <PublicLayout>
        <ForgotPassword />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/forgot-password-2',
    element: (
      <PublicLayout>
        <ForgotPassword2 />
      </PublicLayout>
    ),
  },
  {
    path: '/auth/forgot-password-3',
    element: (
      <PublicLayout>
        <ForgotPassword3 />
      </PublicLayout>
    ),
  },

  // Error Pages
  {
    path: '/errors/unauthorized',
    element: (
      <PublicLayout>
        <Unauthorized />
      </PublicLayout>
    ),
  },
  {
    path: '/errors/forbidden',
    element: (
      <PublicLayout>
        <Forbidden />
      </PublicLayout>
    ),
  },
  {
    path: '/errors/not-found',
    element: (
      <PublicLayout>
        <NotFound />
      </PublicLayout>
    ),
  },
  {
    path: '/errors/internal-server-error',
    element: (
      <PublicLayout>
        <InternalServerError />
      </PublicLayout>
    ),
  },
  {
    path: '/errors/under-maintenance',
    element: (
      <PublicLayout>
        <UnderMaintenance />
      </PublicLayout>
    ),
  },

  // Settings Routes
  {
    path: '/settings/user',
    element: (
      <ProtectedRoute>
        <UserSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/account',
    element: (
      <ProtectedRoute>
        <AccountSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/billing',
    element: (
      <ProtectedRoute>
        <BillingSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/appearance',
    element: (
      <ProtectedRoute>
        <AppearanceSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/notifications',
    element: (
      <ProtectedRoute>
        <NotificationSettings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings/connections',
    element: (
      <ProtectedRoute>
        <ConnectionSettings />
      </ProtectedRoute>
    ),
  },

  // Catch-all route for 404
  {
    path: '*',
    element: <NotFound />,
  },
];
