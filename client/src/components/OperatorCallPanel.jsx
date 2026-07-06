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
  const nextTicket = waitingTickets[0] || null;

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
    <section className="brand-card p-5">
      <form onSubmit={onCallNext}>
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-stretch">
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-500">Faculty queue</p>
            <p className="mt-1 text-base font-semibold text-monash-ink">{faculty.name}</p>
            <p className="mt-2 text-sm text-slate-600">
              {waitingTickets.length} waiting / {calledTickets.length} currently calling
            </p>
          </div>

          <div className="rounded-md border border-monash-blue/20 bg-monash-blue-soft p-4">
            <p className="text-sm font-medium text-monash-blue">Next waiting</p>
            <p className="mt-1 text-3xl font-semibold text-monash-ink">
              {nextTicket ? nextTicket.ticketNumber : '-'}
            </p>
            <p className="mt-2 text-sm text-slate-600">
              {nextTicket ? 'This ticket will be called next.' : 'No tickets are waiting.'}
            </p>
          </div>

          <button
            className="brand-button-primary min-h-16 w-full px-8 text-base lg:w-56"
            disabled={!canCallNext}
            type="submit"
          >
            {callButtonText}
          </button>
        </div>
      </form>

      {hasActiveCalls && (
        <div className="mt-6 rounded-md border border-monash-blue/20 bg-monash-blue-soft p-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-semibold text-monash-blue">Currently calling</p>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-monash-blue">
              {calledTickets.length} active
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {calledTickets.map((ticket) => (
              <div
                className="rounded-md border border-monash-blue/20 bg-white p-4 shadow-sm"
                key={ticket.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-4xl font-semibold text-monash-ink">
                      {ticket.ticketNumber}
                    </p>
                    <p className="mt-1 text-base font-semibold text-monash-blue">
                      Called for {formatElapsedTime(ticket.calledAt, now)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full bg-monash-blue-soft px-3 py-1 text-sm font-medium text-monash-blue">
                    {ticket.status}
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="brand-button-primary py-2"
                    disabled={isSubmitting}
                    onClick={() => onComplete(ticket)}
                    type="button"
                  >
                    {pendingTicketId === ticket.id && pendingAction === 'done' ? 'Saving...' : 'Done'}
                  </button>
                  <button
                    className="brand-button-secondary"
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
            {waitingTickets.map((ticket, index) => (
              <li
                className={`flex items-center justify-between gap-4 px-4 py-3 ${
                  index === 0 ? 'bg-monash-blue-soft' : 'bg-white'
                }`}
                key={ticket.id}
              >
                <span className="font-semibold text-slate-950">{ticket.ticketNumber}</span>
                <span className="text-sm text-slate-500">
                  {index === 0 ? 'Next' : ticket.status}
                </span>
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
