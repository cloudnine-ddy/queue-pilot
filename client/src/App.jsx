import { Link, Route, Routes, useLocation } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { AdminEventsPage } from './pages/AdminEventsPage.jsx';
import { AdminFacultiesPage } from './pages/AdminFacultiesPage.jsx';
import { AdminLoginPage } from './pages/AdminLoginPage.jsx';
import { AdminOperatorsPage } from './pages/AdminOperatorsPage.jsx';
import { PublicQueuePage } from './pages/PublicQueuePage.jsx';
import { OperatorLoginPage } from './pages/OperatorLoginPage.jsx';
import { OperatorQueuePage } from './pages/OperatorQueuePage.jsx';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && (
        <nav className="border-b border-slate-200 bg-white px-5 py-3">
          <div className="mx-auto flex max-w-3xl gap-4 text-sm font-medium">
            <Link className="text-slate-700 hover:text-slate-950" to="/">
              Public Queue
            </Link>
            <Link className="text-slate-700 hover:text-slate-950" to="/operator">
              Operator
            </Link>
            <Link className="text-slate-700 hover:text-slate-950" to="/admin">
              Admin
            </Link>
          </div>
        </nav>
      )}
      <Routes>
        <Route element={<AdminLoginPage />} path="/admin/login" />
        <Route element={<AdminLayout />} path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route element={<AdminEventsPage />} path="events" />
          <Route element={<AdminFacultiesPage />} path="faculties" />
          <Route element={<AdminOperatorsPage />} path="operators" />
        </Route>
        <Route element={<PublicQueuePage />} path="/" />
        <Route element={<OperatorLoginPage />} path="/operator/login" />
        <Route element={<OperatorQueuePage />} path="/operator" />
      </Routes>
    </>
  );
}

export default App;
