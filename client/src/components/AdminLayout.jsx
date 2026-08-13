import { useEffect, useState } from 'react';
import { NavLink, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { getAdminProfile } from '../api/adminApi.js';
import {
  clearAdminSession,
  readAdminSession,
} from '../pages/adminSession.js';
import { AlertMessage } from './AlertMessage.jsx';

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: '/admin' },
  { icon: 'calendar', label: 'Events', to: '/admin/events' },
  { icon: 'building', label: 'Faculties', to: '/admin/faculties' },
  { icon: 'users', label: 'Operators', to: '/admin/operators' },
];

function NavIcon({ name }) {
  const paths = {
    building: (
      <>
        <path d="M4 21V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v16" />
        <path d="M9 21v-4h3v4" />
        <path d="M8 7h1" />
        <path d="M12 7h1" />
        <path d="M8 11h1" />
        <path d="M12 11h1" />
      </>
    ),
    calendar: (
      <>
        <path d="M7 3v3" />
        <path d="M17 3v3" />
        <path d="M4 8h16" />
        <path d="M5 5h14a1 1 0 0 1 1 1v14H4V6a1 1 0 0 1 1-1Z" />
      </>
    ),
    dashboard: (
      <>
        <path d="M4 13h7V4H4v9Z" />
        <path d="M13 20h7V4h-7v16Z" />
        <path d="M4 20h7v-5H4v5Z" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
        <circle cx="9.5" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.9" />
        <path d="M16 3.1a4 4 0 0 1 0 7.8" />
      </>
    ),
    chevronLeft: <path d="m15 18-6-6 6-6" />,
    chevronRight: <path d="m9 18 6-6-6-6" />,
    signOut: (
      <>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="M16 17l5-5-5-5" />
        <path d="M21 12H9" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {paths[name]}
    </svg>
  );
}

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
    <main className="min-h-screen bg-[#f4f5f8] text-monash-ink">
      <div className="flex min-h-screen">
        <aside
          className={`sticky top-0 h-screen bg-white transition-all ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div className="flex h-full flex-col px-3 py-5">
            <div
              className={`flex items-center gap-2 ${
                isCollapsed ? 'justify-center' : 'justify-between'
              }`}
            >
              {!isCollapsed && (
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-monash-blue text-base font-bold text-white">Q</span>
                  <div>
                    <p className="text-sm font-bold text-monash-ink">Queue Pilot</p>
                    <p className="mt-0.5 text-xs font-medium text-slate-500">Admin workspace</p>
                  </div>
                </div>
              )}
              <button
                aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-monash-blue-soft hover:text-monash-blue"
                onClick={() => setIsCollapsed((value) => !value)}
                type="button"
              >
                <NavIcon name={isCollapsed ? 'chevronRight' : 'chevronLeft'} />
              </button>
            </div>

            <nav className="mt-8 space-y-2">
              {navItems.map((item) => (
                <NavLink
                  className={({ isActive }) =>
                    `flex items-center rounded-2xl text-[15px] font-semibold ${
                      isCollapsed
                        ? 'mx-auto h-11 w-11 justify-center px-0 py-0'
                        : 'gap-3 px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-monash-blue-soft text-monash-blue'
                        : 'text-slate-700 hover:bg-monash-blue-soft hover:text-monash-blue'
                    }`
                  }
                  end={item.to === '/admin'}
                  key={item.to}
                  to={item.to}
                  title={item.label}
                >
                  <NavIcon name={item.icon} />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              ))}
            </nav>

            <div className="mt-auto pt-4">
              {!isCollapsed && (
                <div className="mb-3 rounded-2xl bg-[#f4f5f8] px-4 py-3">
                  <p className="text-xs font-medium text-slate-500">Signed in as</p>
                  <p className="mt-1 truncate text-sm font-semibold text-monash-ink">{admin?.name}</p>
                </div>
              )}
              <button
                aria-label="Sign out"
                className={`brand-button-secondary flex items-center justify-center gap-2 ${
                  isCollapsed ? 'mx-auto h-10 w-10 px-0 py-0' : 'w-full px-3'
                }`}
                onClick={handleSignOut}
                type="button"
              >
                <NavIcon name="signOut" />
                {!isCollapsed && <span>Sign out</span>}
              </button>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-5 py-7 lg:px-8">
          <div className="admin-workspace mx-auto max-w-6xl">
            <AlertMessage message={error} />
            <Outlet context={{ admin, session }} />
          </div>
        </section>
      </div>
    </main>
  );
}

