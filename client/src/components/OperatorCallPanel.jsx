export function OperatorCallPanel({
  calledTicket,
  faculties,
  isSubmitting,
  onCallNext,
  onChangeFaculty,
  selectedFacultyId,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={onCallNext}>
        <label className="block text-sm font-medium text-slate-700" htmlFor="operator-faculty">
          Faculty queue
        </label>
        <select
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="operator-faculty"
          onChange={(event) => onChangeFaculty(event.target.value)}
          value={selectedFacultyId}
        >
          {faculties.map((faculty) => (
            <option key={faculty.id} value={faculty.id}>
              {faculty.name}
            </option>
          ))}
        </select>

        <button
          className="mt-6 w-full rounded-md bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!selectedFacultyId || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Calling next...' : 'Call next'}
        </button>
      </form>

      {calledTicket && (
        <div className="mt-6 rounded-md bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-800">Now calling</p>
          <p className="mt-2 text-4xl font-semibold text-emerald-950">
            {calledTicket.ticketNumber}
          </p>
          <p className="mt-2 text-sm text-emerald-900">{calledTicket.faculty.name}</p>
        </div>
      )}
    </section>
  );
}
