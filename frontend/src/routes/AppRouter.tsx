import { createRootRoute, createRoute, createRouter, Navigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { ReimbursementsListPage } from '@/pages/ReimbursementsListPage';
import { ReimbursementDetailPage } from '@/pages/ReimbursementDetailPage';
import { ReimbursementNewPage, ReimbursementEditPage } from '@/pages/ReimbursementFormPage';
import { PendingReimbursementsPage, ApprovedReimbursementsPage } from '@/pages/ReimbursementWorkflowPage';
import { CategoriesPage } from '@/pages/CategoriesPage';
import { UsersPage } from '@/pages/UsersPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { App } from '@/App';

//rota raiz
const rootRoute = createRootRoute({
  component: App,
  notFoundComponent: NotFoundPage,
});

//rota inicial com logica de redirecionamento
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return null;
    }

    return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
  },
});

//rota de login
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

//rota do painel com proteçao
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

//rota de listagem de reembolsos
const reimbursementsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements',
  component: ReimbursementsListPage,
});

//rota de criaçao de reembolso
const reimbursementNewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/new',
  component: ReimbursementNewPage,
});

//rota do fluxo de reembolsos pendentes
const reimbursementPendingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/pending',
  component: PendingReimbursementsPage,
});

//rota do fluxo de reembolsos aprovados
const reimbursementApprovedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/approved',
  component: ApprovedReimbursementsPage,
});

//rota de detalhes do reembolso
const reimbursementDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/$id',
  component: ReimbursementDetailPage,
});

//rota de ediçao de reembolso
const reimbursementEditRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reimbursements/$id/edit',
  component: ReimbursementEditPage,
});

//rota de gerenciamento de categorias
const categoriesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/categories',
  component: CategoriesPage,
});

//rota de gerenciamento de usuarios
const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/users',
  component: UsersPage,
});

//rota de relatorios (apenas admin)
const reportsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/reports',
  component: ReportsPage,
});

//rota 404 (qualquer rota que nao exista cai aqui tambem)
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '$',
  component: NotFoundPage,
});

//criar arvore de rotas
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  dashboardRoute,
  reimbursementsRoute,
  reimbursementNewRoute,
  reimbursementPendingRoute,
  reimbursementApprovedRoute,
  reimbursementDetailRoute,
  reimbursementEditRoute,
  categoriesRoute,
  usersRoute,
  reportsRoute,
  notFoundRoute,
]);

//criar roteador
export const router = createRouter({
  routeTree,
  defaultNotFoundComponent: NotFoundPage,
});