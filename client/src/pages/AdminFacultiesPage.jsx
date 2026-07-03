import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAdminOverview } from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

export function AdminFacultiesPage() {
  const { session } = useOutletContext();
  const [faculties, setFaculties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadFaculties() {
      try {
        setIsLoading(true);
        setError('');
        const overview = await getAdminOverview(session.token);
        setFaculties(overview.faculties || []);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadFaculties();
  }, [session.token]);

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading faculties...</p>;
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Faculties
        </h1>
      </header>

      <AlertMessage message={error} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Faculty list</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Active event faculties
            </h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {faculties.length} faculties
          </span>
        </div>

        {faculties.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Code</th>
                  <th className="px-4 py-3 font-semibold">Name</th>
                  <th className="pl-4 py-3 font-semibold">Operator</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr className="border-b border-slate-100 last:border-0" key={faculty.id}>
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {faculty.code}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{faculty.name}</td>
                    <td className="pl-4 py-4 text-slate-700">
                      {faculty.operator ? faculty.operator.name : 'Unassigned'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No active event faculties.
          </p>
        )}
      </section>
    </>
  );
}
