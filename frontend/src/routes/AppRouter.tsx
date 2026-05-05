import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReimbursementsListPage } from '@/pages/ReimbursementsListPage';
import { ReimbursementDetailPage } from '@/pages/ReimbursementDetailPage';
import { ReimbursementNewPage, ReimbursementEditPage } from '@/pages/ReimbursementFormPage';
import { PendingReimbursementsPage, ApprovedReimbursementsPage } from '@/pages/ReimbursementWorkflowPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
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

// Reimbursements list route
const reimbursementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements',
  component: ReimbursementsListPage,
});

// Reimbursement creation route
const reimbursementNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/new',
  component: ReimbursementNewPage,
});

// Reimbursement pending workflow route
const reimbursementPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/pending',
  component: PendingReimbursementsPage,
});

// Reimbursement approved workflow route
const reimbursementApprovedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/approved',
  component: ApprovedReimbursementsPage,
});

// Reimbursement detail route
const reimbursementDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/$id',
  component: ReimbursementDetailPage,
});

// Reimbursement edit route
const reimbursementEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/$id/edit',
  component: ReimbursementEditPage,
});

// Categories management route
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoriesPage,
});

// 404 route (catch-all)
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: NotFoundPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  reimbursementsRoute,
  reimbursementNewRoute,
  reimbursementPendingRoute,
  reimbursementApprovedRoute,
  reimbursementDetailRoute,
  reimbursementEditRoute,
  categoriesRoute,
  notFoundRoute,
]);

// Create router
export const router = createRouter({ 
  routeTree,
});