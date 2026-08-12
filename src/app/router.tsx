import { createBrowserRouter } from 'react-router-dom';
import { AdminShell } from '../shared/layout/AdminShell';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { NutrizesPage } from '../features/nutrizes/pages/NutrizesPage';
import { RelatoriosPage } from '../features/relatorios/pages/RelatoriosPage';

export const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  {
    path: '/',
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'nutrizes', element: <NutrizesPage /> },
      { path: 'relatorios', element: <RelatoriosPage /> },
    ],
  },
]);
