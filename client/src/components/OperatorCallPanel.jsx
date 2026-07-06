import { useEffect, useState } from 'react';
import { formatElapsedTime } from '../utils/time.js';

export function OperatorCallPanel({
  calledTickets,
  faculty,
  isSubmitting,
  onCallNext,
  onComplete,
  onSkip,
  pendingAction,
  pendingTicketId,
  waitingTickets,
}) {
  const [now, setNow] = useState(() => Date.now());
  const hasActiveCalls = calledTickets.length > 0;
  const canCallNext = !isSubmitting && waitingTickets.length > 0;

  useEffect(() => {
    if (!hasActiveCalls) {
      return undefined;
    }

    setNow(Date.now());
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [hasActiveCalls]);

  let callButtonText = 'Call next';

  if (isSubmitting) {
    callButtonText = 'Calling next...';
  } else if (waitingTickets.length === 0) {
    callButtonText = 'No tickets waiting';
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={onCallNext}>
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Faculty queue</p>
          <p className="mt-1 text-base font-semibold text-slate-950">{faculty.name}</p>
        </div>

        <button
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!canCallNext}
          type="submit"
        >
          {callButtonText}
        </button>
      </form>

      {hasActiveCalls && (
        <div className="mt-6 rounded-md bg-emerald-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-emerald-800">Currently calling</p>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-emerald-800">
              {calledTickets.length} active
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {calledTickets.map((ticket) => (
              <div
                className="rounded-md border border-emerald-200 bg-white p-4"
                key={ticket.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-3xl font-semibold text-emerald-950">
                      {ticket.ticketNumber}
                    </p>
                    <p className="mt-1 text-sm font-medium text-emerald-900">
                      Called for {formatElapsedTime(ticket.calledAt, now)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
                    {ticket.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                    disabled={isSubmitting}
                    onClick={() => onComplete(ticket)}
                    type="button"
                  >
                    {pendingTicketId === ticket.id && pendingAction === 'done' ? 'Saving...' : 'Done'}
                  </button>
                  <button
                    className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:text-slate-400"
                    disabled={isSubmitting}
                    onClick={() => onSkip(ticket)}
                    type="button"
                  >
                    {pendingTicketId === ticket.id && pendingAction === 'skip' ? 'Skipping...' : 'Skip'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!hasActiveCalls && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          No tickets are currently being called.
        </div>
      )}

      <div className="mt-6 border-t border-slate-200 pt-5">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-base font-semibold text-slate-950">Waiting queue</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {waitingTickets.length} waiting
          </span>
        </div>

        {waitingTickets.length > 0 ? (
          <ol className="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200">
            {waitingTickets.map((ticket) => (
              <li
                className="flex items-center justify-between gap-4 px-4 py-3"
                key={ticket.id}
              >
                <span className="font-semibold text-slate-950">{ticket.ticketNumber}</span>
                <span className="text-sm text-slate-500">{ticket.status}</span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No waiting tickets.
          </p>
        )}
      </div>
    </section>
  );
}
