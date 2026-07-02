export function TicketStatusCard({ isSubmitting, onRefresh, onReset, ticket }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">Your number</p>
          <p className="mt-2 text-5xl font-semibold tracking-normal text-slate-950">
            {ticket.ticketNumber}
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-800">
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

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button
          className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          onClick={onRefresh}
          type="button"
        >
          Refresh status
        </button>
        <button
          className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
          disabled={isSubmitting}
          onClick={onReset}
          type="button"
        >
          Take another number
        </button>
      </div>
    </section>
  );
}
