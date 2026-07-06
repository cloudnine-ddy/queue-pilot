import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  createFaculty,
  getAdminFaculties,
  updateFaculty,
} from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';

export function AdminFacultiesPage() {
  const { session } = useOutletContext();
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyToToggle, setFacultyToToggle] = useState(null);
  const [error, setError] = useState('');

  async function loadFaculties() {
    const facultyList = await getAdminFaculties(session.token);
    setFaculties(facultyList);
  }

  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setError('');
        await loadFaculties();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, [session.token]);

  async function handleCreateFaculty(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      await createFaculty({ name, code }, session.token);
      setName('');
      setCode('');
      await loadFaculties();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleFaculty(faculty) {
    try {
      setError('');
      await updateFaculty(faculty.id, { isActive: !faculty.isActive }, session.token);
      setFacultyToToggle(null);
      await loadFaculties();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  const activeCount = faculties.filter((faculty) => faculty.isActive).length;
  const deletedCount = faculties.length - activeCount;

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading faculties...</p>;
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-monash-blue">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Faculties
        </h1>
      </header>

      <AlertMessage message={error} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Add faculty</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Faculty master list
          </h2>
        </div>

        <form className="mt-5 grid gap-3 md:grid-cols-[1fr_160px_auto]" onSubmit={handleCreateFaculty}>
          <label className="sr-only" htmlFor="faculty-name">
            Faculty name
          </label>
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
            id="faculty-name"
            onChange={(event) => setName(event.target.value)}
            placeholder="School of Example"
            type="text"
            value={name}
          />

          <label className="sr-only" htmlFor="faculty-code">
            Faculty code
          </label>
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base uppercase text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
            id="faculty-code"
            onChange={(event) => setCode(event.target.value)}
            placeholder="EX"
            type="text"
            value={code}
          />

          <button
            className="rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting || !name.trim() || !code.trim()}
            type="submit"
          >
            {isSubmitting ? 'Adding...' : 'Add faculty'}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Faculties</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              All faculties
            </h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {activeCount} active / {deletedCount} deleted
          </span>
        </div>

        {faculties.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[760px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Operator</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="pl-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr className="border-b border-slate-100 last:border-0" key={faculty.id}>
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {faculty.code}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{faculty.name}</td>
                    <td className="px-4 py-4 text-slate-700">
                      {faculty.operator ? faculty.operator.name : 'Unassigned'}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          faculty.isActive
                            ? 'bg-emerald-50 text-monash-blue'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {faculty.isActive ? 'Active' : 'Deleted'}
                      </span>
                    </td>
                    <td className="pl-4 py-4 text-right">
                      <button
                        className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                          faculty.isActive
                            ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                            : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                        onClick={() =>
                          faculty.isActive
                            ? setFacultyToToggle(faculty)
                            : handleToggleFaculty(faculty)
                        }
                        type="button"
                      >
                        {faculty.isActive ? 'Delete' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No faculties found.
          </p>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="Delete"
        intent="danger"
        isOpen={Boolean(facultyToToggle)}
        message={
          facultyToToggle
            ? `${facultyToToggle.name} will be hidden from future event setup. Existing event data will stay in the database.`
            : ''
        }
        onCancel={() => setFacultyToToggle(null)}
        onConfirm={() => handleToggleFaculty(facultyToToggle)}
        title="Delete from visible list?"
      />
    </>
  );
}

