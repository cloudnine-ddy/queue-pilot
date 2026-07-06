import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout.jsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.jsx';
import { AdminEventsPage } from './pages/AdminEventsPage.jsx';
import { AdminEventDetailPage } from './pages/AdminEventDetailPage.jsx';
import { AdminFacultiesPage } from './pages/AdminFacultiesPage.jsx';
import { AdminLoginPage } from './pages/AdminLoginPage.jsx';
import { AdminOperatorsPage } from './pages/AdminOperatorsPage.jsx';
import { PublicQueuePage } from './pages/PublicQueuePage.jsx';
import { TicketStatusPage } from './pages/TicketStatusPage.jsx';
import { OperatorLoginPage } from './pages/OperatorLoginPage.jsx';
import { OperatorQueuePage } from './pages/OperatorQueuePage.jsx';

function App() {
  return (
    <>
      <Routes>
        <Route element={<AdminLoginPage />} path="/admin/login" />
        <Route element={<AdminLayout />} path="/admin">
          <Route index element={<AdminDashboardPage />} />
          <Route element={<AdminEventsPage />} path="events" />
          <Route element={<AdminEventDetailPage />} path="events/:eventId" />
          <Route element={<AdminFacultiesPage />} path="faculties" />
          <Route element={<AdminOperatorsPage />} path="operators" />
        </Route>
        <Route element={<PublicQueuePage />} path="/" />
        <Route element={<TicketStatusPage />} path="/tickets/:token" />
        <Route element={<OperatorLoginPage />} path="/operator/login" />
        <Route element={<OperatorQueuePage />} path="/operator" />
      </Routes>
    </>
  );
}

export default App;
