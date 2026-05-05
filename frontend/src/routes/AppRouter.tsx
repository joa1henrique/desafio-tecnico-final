import { RootRoute, Route, createRouter } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { App } from '@/App';

// Root route
const rootRoute = new RootRoute({
  component: App,
});

// Login route
const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

// Dashboard route with protection
const dashboardRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

// 404 route (catch-all)
const notFoundRoute = new Route({
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