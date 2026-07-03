import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  createEvent,
  endEvent,
  getAdminOverview,
  getAdminProfile,
} from '../api/adminApi.js';
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
  const [overview, setOverview] = useState(null);
  const [eventName, setEventName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isEndingEvent, setIsEndingEvent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAdminData() {
      if (!session?.token) {
        return;
      }

      try {
        setIsLoading(true);
        setError('');

        const [adminProfile, adminOverview] = await Promise.all([
          getAdminProfile(session.token),
          getAdminOverview(session.token),
        ]);

        setAdmin(adminProfile);
        setOverview(adminOverview);
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

  async function handleEndEvent() {
    if (!event?.id || !session?.token) {
      return;
    }

    const confirmed = window.confirm(`End ${event.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsEndingEvent(true);
      setError('');

      await endEvent(event.id, session.token);
      const adminOverview = await getAdminOverview(session.token);
      setOverview(adminOverview);
    } catch (endError) {
      setError(endError.message);
    } finally {
      setIsEndingEvent(false);
    }
  }

  async function handleCreateEvent(formEvent) {
    formEvent.preventDefault();

    if (!session?.token) {
      return;
    }

    try {
      setIsCreatingEvent(true);
      setError('');

      await createEvent(eventName, session.token);
      setEventName('');

      const adminOverview = await getAdminOverview(session.token);
      setOverview(adminOverview);
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreatingEvent(false);
    }
  }

  const event = overview?.event;
  const faculties = overview?.faculties || [];
  const totals = overview?.totals || {
    waiting: 0,
    called: 0,
    done: 0,
    skipped: 0,
    total: 0,
  };

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
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600">
                {event?.status || 'Unavailable'}
              </p>
              <button
                className="w-fit rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                disabled={!event?.id || isEndingEvent}
                onClick={handleEndEvent}
                type="button"
              >
                {isEndingEvent ? 'Ending...' : 'End event'}
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Queue total</p>
            <h2 className="mt-2 text-xl font-semibold text-slate-950">
              {totals.total} tickets
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              {totals.waiting} waiting, {totals.called} called
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Create event</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Add active event
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                {event
                  ? 'End the current active event before creating a new one.'
                  : 'The new event will start immediately and include all faculties.'}
              </p>
            </div>
          </div>

          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateEvent}>
            <label className="sr-only" htmlFor="event-name">
              Event name
            </label>
            <input
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
              disabled={Boolean(event) || isCreatingEvent}
              id="event-name"
              onChange={(inputEvent) => setEventName(inputEvent.target.value)}
              placeholder="Monash Open Day August"
              type="text"
              value={eventName}
            />
            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={Boolean(event) || isCreatingEvent || !eventName.trim()}
              type="submit"
            >
              {isCreatingEvent ? 'Creating...' : 'Create event'}
            </button>
          </form>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Faculties</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                Event queue overview
              </h2>
            </div>
            <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              {faculties.length} active queues
            </span>
          </div>

          {faculties.length > 0 ? (
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-3 pr-4 font-semibold">Faculty</th>
                    <th className="px-4 py-3 font-semibold">Operator</th>
                    <th className="px-4 py-3 text-right font-semibold">Waiting</th>
                    <th className="px-4 py-3 text-right font-semibold">Called</th>
                    <th className="px-4 py-3 text-right font-semibold">Done</th>
                    <th className="pl-4 py-3 text-right font-semibold">Skipped</th>
                  </tr>
                </thead>
                <tbody>
                  {faculties.map((faculty) => (
                    <tr className="border-b border-slate-100 last:border-0" key={faculty.id}>
                      <td className="py-4 pr-4">
                        <p className="font-semibold text-slate-950">{faculty.name}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">{faculty.code}</p>
                      </td>
                      <td className="px-4 py-4 text-slate-700">
                        {faculty.operator ? faculty.operator.name : 'Unassigned'}
                      </td>
                      <td className="px-4 py-4 text-right font-semibold text-slate-950">
                        {faculty.queue.waiting}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-700">
                        {faculty.queue.called}
                      </td>
                      <td className="px-4 py-4 text-right text-slate-700">
                        {faculty.queue.done}
                      </td>
                      <td className="pl-4 py-4 text-right text-slate-700">
                        {faculty.queue.skipped}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
              No faculties are assigned to the active event.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
