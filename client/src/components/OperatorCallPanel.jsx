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
    <section className="space-y-5">
      <form onSubmit={onCallNext}>
        <div className="brand-card p-5 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-eyebrow">Next in queue</p>
              <p className="mt-2 text-5xl font-bold tracking-[-0.04em] text-monash-ink sm:text-6xl">
              {nextTicket ? nextTicket.ticketNumber : '-'}
              </p>
            </div>
            <span className="status-pill bg-monash-blue-soft text-monash-blue">
              {waitingTickets.length} waiting
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            {nextTicket ? `Next visitor for ${faculty.name}.` : 'The queue is currently clear.'}
          </p>
          <button
            className="brand-button-primary mt-6 min-h-14 w-full text-base"
            disabled={!canCallNext}
            type="submit"
          >
            {callButtonText}
          </button>
        </div>
      </form>

      {hasActiveCalls && (
        <div className="brand-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="section-eyebrow">In progress</p>
              <h2 className="section-title">Currently calling</h2>
            </div>
            <span className="status-pill bg-monash-blue-soft text-monash-blue">
              {calledTickets.length} active
            </span>
          </div>

          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {calledTickets.map((ticket) => (
              <div
                className="rounded-[1.4rem] bg-monash-blue-soft p-5"
                key={ticket.id}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-4xl font-bold tracking-[-0.03em] text-monash-ink">
                      {ticket.ticketNumber}
                    </p>
                    <p className="mt-1 text-base font-semibold text-monash-blue">
                      Called for {formatElapsedTime(ticket.calledAt, now)}
                    </p>
                  </div>
                  <span className="status-pill w-fit bg-white text-monash-blue">
                    Called
                  </span>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    className="brand-button-primary flex-1 py-3"
                    disabled={isSubmitting}
                    onClick={() => onComplete(ticket)}
                    type="button"
                  >
                    {pendingTicketId === ticket.id && pendingAction === 'done' ? 'Saving...' : 'Done'}
                  </button>
                  <button
                    className="brand-button-secondary flex-1 border-white"
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
        <div className="brand-card flex items-center gap-4 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">✓</span>
          <div>
            <p className="font-semibold text-monash-ink">No active calls</p>
            <p className="mt-1 text-sm text-slate-500">Call the next visitor when a counsellor is ready.</p>
          </div>
        </div>
      )}

      <div className="brand-card p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">Queue</p>
            <h2 className="section-title">Waiting visitors</h2>
          </div>
          <span className="status-pill bg-slate-100 text-slate-600">
            {waitingTickets.length} waiting
          </span>
        </div>

        {waitingTickets.length > 0 ? (
          <ol className="mt-5 space-y-2">
            {waitingTickets.map((ticket, index) => (
              <li
                className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 ${
                  index === 0 ? 'bg-monash-blue-soft' : 'bg-[#f4f5f8]'
                }`}
                key={ticket.id}
              >
                <span className="font-semibold text-slate-950">{ticket.ticketNumber}</span>
                <span className={`text-sm font-medium ${index === 0 ? 'text-monash-blue' : 'text-slate-500'}`}>
                  {index === 0 ? 'Next' : ticket.status}
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-5 rounded-2xl bg-[#f4f5f8] px-4 py-4 text-sm text-slate-500">
            No waiting tickets.
          </p>
        )}
      </div>
    </section>
  );
}
