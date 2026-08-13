import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { getAdminOverview } from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

const quickLinks = [
  {
    description: 'Create events, start queues and review completed event summaries.',
    label: 'Manage events',
    to: '/admin/events',
  },
  {
    description: 'Maintain the visible faculty list used when setting up events.',
    label: 'Faculty list',
    to: '/admin/faculties',
  },
  {
    description: 'Create and update accounts that can operate live queues.',
    label: 'Operators',
    to: '/admin/operators',
  },
];

function MetricCard({ label, value }) {
  return (
    <div className="rounded-[1.4rem] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.035)]">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-[-0.025em] text-monash-ink">{value}</p>
    </div>
  );
}

export function AdminDashboardPage() {
  const { session } = useOutletContext();
  const [overview, setOverview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOverview() {
      try {
        setIsLoading(true);
        setError('');
        const overviewData = await getAdminOverview(session.token);
        setOverview(overviewData);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOverview();
  }, [session.token]);

  const event = overview?.event || null;
  const faculties = overview?.faculties || [];
  const totals = overview?.totals || {
    called: 0,
    cancelled: 0,
    done: 0,
    skipped: 0,
    total: 0,
    waiting: 0,
  };

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading dashboard...</p>;
  }

  return (
    <>
      <header className="mb-7">
        <p className="brand-kicker">Admin</p>
        <h1 className="brand-title">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-slate-600">
          Monitor the active event and jump into the main admin workflows.
        </p>
      </header>

      <AlertMessage message={error} />

      <section className="brand-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-eyebrow">Active event</p>
            <h2 className="section-title">
              {event ? event.name : 'No active event'}
            </h2>
            <p className="mt-2 text-[15px] leading-6 text-slate-600">
              {event
                ? `Started ${new Date(event.startAt).toLocaleString()}`
                : 'Start an upcoming event when the queue is ready to open.'}
            </p>
            {event?.scheduledEndAt && (
              <p className="mt-1 text-sm text-slate-500">
                Scheduled end {new Date(event.scheduledEndAt).toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            {event && (
              <Link
                className="brand-button-primary inline-flex justify-center py-3"
                to={`/admin/events/${event.id}`}
              >
                View active queue
              </Link>
            )}
            <Link
              className="brand-button-secondary inline-flex justify-center"
              to="/admin/events"
            >
              Manage events
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard label="Total" value={totals.total} />
        <MetricCard label="Waiting" value={totals.waiting} />
        <MetricCard label="Called" value={totals.called} />
        <MetricCard label="Done" value={totals.done} />
        <MetricCard label="Skipped / Cancelled" value={`${totals.skipped} / ${totals.cancelled}`} />
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Link
            className="group rounded-[1.4rem] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:shadow-md"
            key={link.to}
            to={link.to}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-lg font-semibold text-monash-ink">{link.label}</p>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 group-hover:bg-monash-blue-soft group-hover:text-monash-blue">→</span>
            </div>
            <p className="mt-2 text-[15px] leading-6 text-slate-600">{link.description}</p>
          </Link>
        ))}
      </section>

      <section className="brand-card mt-6 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">Live queues</p>
            <h2 className="section-title">Faculty status</h2>
          </div>
          <span className="status-pill bg-slate-100 text-slate-600">
            {faculties.length} faculties
          </span>
        </div>

        {faculties.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Faculty</th>
                  <th className="px-4 py-3 font-semibold">Operator</th>
                  <th className="px-4 py-3 text-right font-semibold">Waiting</th>
                  <th className="px-4 py-3 text-right font-semibold">Called</th>
                  <th className="pl-4 py-3 text-right font-semibold">Done</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr className="border-b border-slate-100 last:border-0" key={faculty.id}>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-slate-950">{faculty.name}</p>
                      <p className="mt-1 text-sm text-slate-500">{faculty.code}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {faculty.operator ? faculty.operator.name : 'Unassigned'}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-950">
                      {faculty.queue.waiting}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">{faculty.queue.called}</td>
                    <td className="pl-4 py-4 text-right text-slate-700">{faculty.queue.done}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-[15px] text-slate-600">
            No active queue data is available.
          </p>
        )}
      </section>
    </>
  );
}
