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
        <label className="block text-sm font-medium text-slate-700" htmlFor="faculty">
          Faculty
        </label>
        <select
          className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          id="faculty"
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
