export function OperatorCallPanel({
  calledTicket,
  faculty,
  isSubmitting,
  onCallNext,
  onComplete,
  onSkip,
  waitingTickets,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={onCallNext}>
        <div className="rounded-md bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Faculty queue</p>
          <p className="mt-1 text-base font-semibold text-slate-950">{faculty.name}</p>
        </div>

        <button
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Calling next...' : 'Call next'}
        </button>
      </form>

      {calledTicket && (
        <div className="mt-6 rounded-md bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Now calling</p>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-4xl font-semibold text-emerald-950">{calledTicket.ticketNumber}</p>
            <span className="w-fit rounded-full bg-white px-3 py-1 text-sm font-medium text-emerald-800">
              {calledTicket.status}
            </span>
          </div>
          <p className="mt-2 text-sm text-emerald-900">{calledTicket.faculty.name}</p>

          {calledTicket.status === 'CALLED' && (
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={isSubmitting}
                onClick={onComplete}
                type="button"
              >
                Done
              </button>
              <button
                className="rounded-md border border-emerald-300 bg-white px-4 py-2 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSubmitting}
                onClick={onSkip}
                type="button"
              >
                Skip
              </button>
            </div>
          )}
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
