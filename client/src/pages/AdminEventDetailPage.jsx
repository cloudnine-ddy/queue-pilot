import { useEffect, useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import { getAdminEventDetail } from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

export function AdminEventDetailPage() {
  const { eventId } = useParams();
  const { session } = useOutletContext();
  const [detail, setDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadEventDetail() {
      try {
        setIsLoading(true);
        setError('');
        const eventDetail = await getAdminEventDetail(eventId, session.token);
        setDetail(eventDetail);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEventDetail();
  }, [eventId, session.token]);

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading event...</p>;
  }

  const event = detail?.event;
  const faculties = detail?.faculties || [];
  const tickets = detail?.tickets || [];
  const totals = detail?.totals || {
    waiting: 0,
    called: 0,
    done: 0,
    skipped: 0,
    total: 0,
  };

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <Link className="text-sm font-semibold text-slate-600 hover:text-slate-950" to="/admin/events">
          Back to events
        </Link>
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Event detail
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          {event?.name || 'Event'}
        </h1>
        <p className="mt-2 text-sm text-slate-600">{event?.status}</p>
      </header>

      <AlertMessage message={error} />

      <section className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Waiting</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.waiting}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Called</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.called}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Done</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{totals.done}</p>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Queues</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Faculty queues</h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {faculties.length} faculties
          </span>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
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
                    <p className="mt-1 text-xs text-slate-500">{faculty.code}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-700">
                    {faculty.operator ? faculty.operator.name : 'Unassigned'}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-slate-950">
                    {faculty.queue.waiting}
                  </td>
                  <td className="px-4 py-4 text-right text-slate-700">{faculty.queue.called}</td>
                  <td className="px-4 py-4 text-right text-slate-700">{faculty.queue.done}</td>
                  <td className="pl-4 py-4 text-right text-slate-700">{faculty.queue.skipped}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Tickets</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Recent tickets</h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {tickets.length} shown
          </span>
        </div>

        {tickets.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Ticket</th>
                  <th className="px-4 py-3 font-semibold">Faculty</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="pl-4 py-3 font-semibold">Created</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr className="border-b border-slate-100 last:border-0" key={ticket.id}>
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {ticket.ticketNumber}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{ticket.faculty.name}</td>
                    <td className="px-4 py-4 text-slate-700">{ticket.status}</td>
                    <td className="pl-4 py-4 text-slate-700">
                      {new Date(ticket.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No tickets for this event.
          </p>
        )}
      </section>
    </>
  );
}
