import { useEffect, useState } from 'react';
import {
  getTicketStatusContent,
  isActiveTicketStatus,
} from '../constants/ticketStatus.js';
import { formatElapsedTime } from '../utils/time.js';

export function TicketStatusCard({ isSubmitting, onAbandon, onRefresh, ticket }) {
  const [now, setNow] = useState(() => Date.now());
  const canAbandon = isActiveTicketStatus(ticket.status);
  const isCalled = ticket.status === 'CALLED' && ticket.calledAt;
  const content = getTicketStatusContent(ticket.status);

  useEffect(() => {
    if (!isCalled) {
      return undefined;
    }

    setNow(Date.now());
    const intervalId = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [isCalled, ticket.calledAt]);

  return (
    <section className="brand-card overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-eyebrow">Your queue number</p>
          <p className="mt-2 text-6xl font-bold tracking-[-0.04em] text-monash-ink sm:text-7xl">
            {ticket.ticketNumber}
          </p>
          <p className="mt-2 text-[15px] text-slate-600">
            {ticket.event?.name ? ticket.event.name : 'Current event'}
          </p>
        </div>
        <span className={`status-pill w-fit ${content.badgeClass}`}>
          {content.label}
        </span>
      </div>

      <dl className="mt-7 grid grid-cols-2 gap-3">
        <div className="soft-panel">
          <dt className="text-sm font-medium text-slate-500">Faculty</dt>
          <dd className="mt-1 text-base font-semibold text-monash-ink">{ticket.faculty.name}</dd>
        </div>
        <div className="soft-panel">
          <dt className="text-sm font-medium text-slate-500">People ahead</dt>
          <dd className="mt-1 text-3xl font-bold text-monash-ink">{ticket.peopleAhead}</dd>
        </div>
      </dl>

      {ticket.status === 'WAITING' && (
        <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3.5 text-sm font-medium leading-5 text-amber-900">
          You are in the queue. This page updates automatically, but you can refresh manually if needed.
        </div>
      )}

      {ticket.status === 'CALLED' && (
        <div className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3.5 text-sm font-medium leading-5 text-emerald-900">
          Please proceed to the {ticket.faculty.name} counter area.
          {isCalled && (
            <span className="mt-1 block text-emerald-800">
              Called for {formatElapsedTime(ticket.calledAt, now)}
            </span>
          )}
        </div>
      )}

      {content.message && (
        <div className="mt-5 rounded-2xl bg-slate-100 px-4 py-3.5 text-sm font-medium leading-5 text-slate-700">
          {content.message}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="brand-button-primary flex-1"
          disabled={isSubmitting}
          onClick={onRefresh}
          type="button"
        >
          Refresh status
        </button>
        {canAbandon ? (
          <button
            className="flex-1 rounded-2xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
            disabled={isSubmitting}
            onClick={onAbandon}
            type="button"
          >
            Abandon ticket
          </button>
        ) : (
          <a
            className="brand-button-secondary text-center"
            href="/"
          >
            Back to queue
          </a>
        )}
      </div>
    </section>
  );
}
