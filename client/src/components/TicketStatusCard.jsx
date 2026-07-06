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
    <section className="brand-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Your number</p>
          <p className="mt-2 text-6xl font-semibold tracking-normal text-monash-ink">
            {ticket.ticketNumber}
          </p>
          <p className="mt-2 text-[15px] text-slate-600">
            {ticket.event?.name ? ticket.event.name : 'Current event'}
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${content.badgeClass}`}>
          {content.label}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-4">
          <dt className="text-sm font-medium text-slate-500">Faculty</dt>
          <dd className="mt-1 text-base font-semibold text-monash-ink">{ticket.faculty.name}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-4">
          <dt className="text-sm font-medium text-slate-500">People ahead</dt>
          <dd className="mt-1 text-2xl font-semibold text-monash-ink">{ticket.peopleAhead}</dd>
        </div>
      </dl>

      {ticket.status === 'WAITING' && (
        <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          You are in the queue. This page updates automatically, but you can refresh manually if needed.
        </div>
      )}

      {ticket.status === 'CALLED' && (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Please proceed to the {ticket.faculty.name} counter area.
          {isCalled && (
            <span className="mt-1 block text-emerald-800">
              Called for {formatElapsedTime(ticket.calledAt, now)}
            </span>
          )}
        </div>
      )}

      {content.message && (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {content.message}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="brand-button-primary py-2"
          disabled={isSubmitting}
          onClick={onRefresh}
          type="button"
        >
          Refresh status
        </button>
        {canAbandon ? (
          <button
            className="rounded-md border border-rose-200 bg-white px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
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
