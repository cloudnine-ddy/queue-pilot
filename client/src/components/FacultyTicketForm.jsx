export function FacultyTicketForm({
  faculties,
  isSubmitting,
  onChangeFaculty,
  onSubmit,
  selectedFacultyId,
}) {
  return (
    <section className="brand-card p-5 sm:p-7">
      <form onSubmit={onSubmit}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">Step 1 of 1</p>
            <h2 className="section-title">Choose a queue</h2>
          </div>
          <span className="status-pill bg-slate-100 text-slate-600">
            {faculties.length} available
          </span>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4">
          {faculties.map((faculty) => {
            const isSelected = selectedFacultyId === faculty.id;

            return (
              <button
                aria-pressed={isSelected}
                className={`relative min-h-32 rounded-[1.4rem] px-4 py-4 text-left transition sm:min-h-28 sm:px-5 ${
                  isSelected
                    ? 'bg-monash-blue-soft text-monash-ink ring-2 ring-monash-blue'
                    : 'bg-[#f4f5f8] text-slate-800 hover:bg-slate-100'
                }`}
                key={faculty.id}
                onClick={() => onChangeFaculty(faculty.id)}
                type="button"
              >
                <span className={`inline-flex h-9 min-w-9 items-center justify-center rounded-xl px-2 text-xs font-bold ${isSelected ? 'bg-monash-blue text-white' : 'bg-white text-monash-blue'}`}>
                  {faculty.code}
                </span>
                <span className="mt-4 block text-[15px] font-semibold leading-5">{faculty.name}</span>
                <span className={`absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full ${isSelected ? 'bg-monash-blue text-white' : 'bg-white text-transparent'}`}>
                  ✓
                </span>
              </button>
            );
          })}
        </div>

        <button
          className="brand-button-primary mt-6 w-full"
          disabled={!selectedFacultyId || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Creating your ticket...' : 'Get my ticket'}
        </button>
      </form>
    </section>
  );
}
