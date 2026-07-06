export function FacultyTicketForm({
  faculties,
  isSubmitting,
  onChangeFaculty,
  onSubmit,
  selectedFacultyId,
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <form onSubmit={onSubmit}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Choose a faculty</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">Queue selection</h2>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {faculties.length} available
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {faculties.map((faculty) => {
            const isSelected = selectedFacultyId === faculty.id;

            return (
              <button
                className={`min-h-24 rounded-md border px-4 py-3 text-left transition ${
                  isSelected
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                    : 'border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:bg-slate-50'
                }`}
                key={faculty.id}
                onClick={() => onChangeFaculty(faculty.id)}
                type="button"
              >
                <span className="block text-sm font-semibold">{faculty.code}</span>
                <span className="mt-2 block text-sm leading-5">{faculty.name}</span>
              </button>
            );
          })}
        </div>

        <button
          className="mt-6 w-full rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!selectedFacultyId || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating number...' : 'Take number'}
        </button>
      </form>
    </section>
  );
}
