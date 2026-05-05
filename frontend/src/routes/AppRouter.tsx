import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { App } from '@/App';

// Root route
const rootRoute = createRootRoute({
  component: App,
});

// Login route
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Dashboard route with protection
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// 404 route (catch-all)
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([loginRoute, dashboardRoute, notFoundRoute]);

// Create router
export const router = createRouter({ 
  routeTree,
});