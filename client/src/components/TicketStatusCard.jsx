const statusContent = {
  WAITING: {
    badgeClass: 'bg-amber-50 text-amber-800',
    message: 'Your number is still waiting in the queue.',
  },
  CALLED: {
    badgeClass: 'bg-emerald-50 text-emerald-800',
    message: null,
  },
  SKIPPED: {
    badgeClass: 'bg-rose-50 text-rose-800',
    message: 'Your number was skipped. Please contact the counter staff if you still need help.',
  },
  CANCELLED: {
    badgeClass: 'bg-slate-100 text-slate-700',
    message: 'This ticket was abandoned.',
  },
  DONE: {
    badgeClass: 'bg-slate-100 text-slate-700',
    message: 'This ticket has been completed.',
  },
};

export function TicketStatusCard({ isSubmitting, onAbandon, onRefresh, ticket }) {
  const canAbandon = ['WAITING', 'CALLED'].includes(ticket.status);
  const content = statusContent[ticket.status] || {
    badgeClass: 'bg-slate-100 text-slate-700',
    message: 'Ticket status is being updated.',
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Your number</p>
          <p className="mt-2 text-5xl font-semibold tracking-normal text-slate-950">
            {ticket.ticketNumber}
          </p>
        </div>
        <span className={`w-fit rounded-full px-3 py-1 text-sm font-medium ${content.badgeClass}`}>
          {ticket.status}
        </span>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md bg-slate-50 p-4">
          <dt className="text-sm font-medium text-slate-500">Faculty</dt>
          <dd className="mt-1 text-base font-semibold text-slate-950">{ticket.faculty.name}</dd>
        </div>
        <div className="rounded-md bg-slate-50 p-4">
          <dt className="text-sm font-medium text-slate-500">People ahead</dt>
          <dd className="mt-1 text-2xl font-semibold text-slate-950">{ticket.peopleAhead}</dd>
        </div>
      </dl>

      {ticket.status === 'CALLED' && (
        <div className="mt-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          Please proceed to the {ticket.faculty.name} counter area.
        </div>
      )}

      {content.message && (
        <div className="mt-5 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
          {content.message}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          onClick={onRefresh}
          type="button"
        >
          Refresh status
        </button>
        {canAbandon ? (
          <button
            className="rounded-md border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:text-rose-300"
            disabled={isSubmitting}
            onClick={onAbandon}
            type="button"
          >
            Abandon ticket
          </button>
        ) : (
          <a
            className="rounded-md border border-slate-300 px-4 py-2 text-center text-sm font-semibold text-slate-800 hover:bg-slate-100"
            href="/"
          >
            Back to queue
          </a>
        )}
      </div>
    </section>
  );
}
