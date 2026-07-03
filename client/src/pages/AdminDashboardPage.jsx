import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { getAdminProfile } from '../api/adminApi.js';
import { getActiveEvent } from '../api/publicApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { adminSessionKey } from './AdminLoginPage.jsx';

function readAdminSession() {
  const storedSession = localStorage.getItem(adminSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    localStorage.removeItem(adminSessionKey);
    return null;
  }
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readAdminSession());
  const [admin, setAdmin] = useState(session?.admin || null);
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      if (!session?.token) {
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const [adminProfile, activeEvent] = await Promise.all([
          getAdminProfile(session.token),
          getActiveEvent(),
        ]);

        setAdmin(adminProfile);
        setEvent(activeEvent);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminData();
  }, [session?.token]);

  function handleSignOut() {
    localStorage.removeItem(adminSessionKey);
    setSession(null);
    navigate('/admin/login');
  }

  if (!session?.token) {
    return <Navigate replace to="/admin/login" />;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-4xl">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Admin
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            Dashboard
          </h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-semibold">{admin?.name}</span>
            </p>
            <button
              className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </header>

        <AlertMessage message={error} />

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Active event</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {event?.name || 'No active event'}
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {event?.status || 'Unavailable'}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Next admin tools</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              Event and operator management
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              This page is ready for protected admin features.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
