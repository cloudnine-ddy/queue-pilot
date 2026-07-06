import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getAdminProfile } from '../api/adminApi.js';
import {
  clearAdminSession,
  readAdminSession,
} from '../pages/adminSession.js';
import { AlertMessage } from './AlertMessage.jsx';

const navItems = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Events', to: '/admin/events' },
  { label: 'Faculties', to: '/admin/faculties' },
  { label: 'Operators', to: '/admin/operators' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readAdminSession());
  const [admin, setAdmin] = useState(session?.admin || null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminProfile() {
      if (!session?.token) {
        return;
      }

      try {
        setIsLoading(true);
        setError('');
        const profile = await getAdminProfile(session.token);
        setAdmin(profile);
      } catch (loadError) {
        clearAdminSession();
        setSession(null);
        navigate('/admin/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadAdminProfile();
  }, [navigate, session?.token]);

  function handleSignOut() {
    clearAdminSession();
    setSession(null);
    navigate('/admin/login');
  }

  if (!session?.token) {
    return <Navigate replace to="/admin/login" />;
  }

  if (isLoading) {
    return (
      <main className="brand-page">
        <div className="mx-auto flex min-h-[70vh] max-w-4xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading admin...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-monash-ink">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 h-screen border-r border-slate-200 bg-white transition-all ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex h-full flex-col px-3 py-4">
            <div className="flex items-center justify-between gap-2">
              {!isCollapsed && (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-monash-blue">
                    Monash
                  </p>
                  <p className="mt-1 text-sm font-semibold text-monash-ink">
                    Queue Pilot
                  </p>
                </div>
              )}
              <button
                className="rounded-md border border-slate-200 px-2 py-1 text-sm font-semibold text-slate-700 hover:border-monash-blue hover:text-monash-blue"
                onClick={() => setIsCollapsed((value) => !value)}
                type="button"
              >
                {isCollapsed ? '>' : '<'}
              </button>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-semibold ${
                      isActive
                        ? 'bg-monash-blue text-white'
                        : 'text-slate-700 hover:bg-monash-blue-soft hover:text-monash-blue'
                    }`
                  }
                  end={item.to === '/admin'}
                  key={item.to}
                  to={item.to}
                  title={item.label}
                >
                  {isCollapsed ? item.label.charAt(0) : item.label}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto border-t border-slate-200 pt-4">
              {!isCollapsed && (
                <p className="mb-3 text-sm text-slate-600">
                  <span className="font-semibold text-monash-ink">{admin?.name}</span>
                </p>
              )}
              <button
                className="brand-button-secondary w-full px-3"
                onClick={handleSignOut}
                type="button"
              >
                {isCollapsed ? 'Out' : 'Sign out'}
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-8">
          <div className="mx-auto max-w-6xl">
            <AlertMessage message={error} />
            <Outlet context={{ admin, session }} />
          </div>
        </section>
      </div>
    </main>
  );
}

