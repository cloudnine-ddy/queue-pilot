import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  createOperator,
  getAdminFaculties,
  getAdminOperators,
  updateOperator,
} from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

export function AdminOperatorsPage() {
  const { session } = useOutletContext();
  const [operators, setOperators] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [facultyId, setFacultyId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadOperatorsPage() {
    const [operatorList, facultyList] = await Promise.all([
      getAdminOperators(session.token),
      getAdminFaculties(session.token),
    ]);
    const activeFaculties = facultyList.filter((faculty) => faculty.isActive);

    setOperators(operatorList);
    setFaculties(activeFaculties);
    setFacultyId((currentFacultyId) => currentFacultyId || activeFaculties[0]?.id || '');
  }

  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setError('');
        await loadOperatorsPage();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, [session.token]);

  async function handleCreateOperator(event) {
    event.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');

      await createOperator({ name, email, password, facultyId }, session.token);
      setName('');
      setEmail('');
      setPassword('password123');
      await loadOperatorsPage();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleChangeFaculty(operatorId, nextFacultyId) {
    try {
      setError('');
      await updateOperator(operatorId, { facultyId: nextFacultyId }, session.token);
      await loadOperatorsPage();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading operators...</p>;
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Operators
        </h1>
      </header>

      <AlertMessage message={error} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Add operator</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Operator accounts
          </h2>
        </div>

        <form className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_160px_1fr_auto]" onSubmit={handleCreateOperator}>
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setName(event.target.value)}
            placeholder="Operator name"
            type="text"
            value={name}
          />
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="operator@example.com"
            type="email"
            value={email}
          />
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Password"
            type="password"
            value={password}
          />
          <select
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            onChange={(event) => setFacultyId(event.target.value)}
            value={facultyId}
          >
            {faculties.map((faculty) => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.code} - {faculty.name}
              </option>
            ))}
          </select>
          <button
            className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={
              isSubmitting ||
              !name.trim() ||
              !email.trim() ||
              !password ||
              !facultyId
            }
            type="submit"
          >
            {isSubmitting ? 'Adding...' : 'Add operator'}
          </button>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Operators</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              All operator accounts
            </h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {operators.length} operators
          </span>
        </div>

        {operators.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Faculty</th>
                  <th className="pl-4 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => (
                  <tr className="border-b border-slate-100 last:border-0" key={operator.id}>
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {operator.name}
                    </td>
                    <td className="px-4 py-4 text-slate-700">{operator.email}</td>
                    <td className="px-4 py-4">
                      <select
                        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                        onChange={(event) => handleChangeFaculty(operator.id, event.target.value)}
                        value={operator.faculty.id}
                      >
                        {faculties.map((faculty) => (
                          <option key={faculty.id} value={faculty.id}>
                            {faculty.code} - {faculty.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="pl-4 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          operator.faculty.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {operator.faculty.isActive ? 'Active faculty' : 'Inactive faculty'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No operators found.
          </p>
        )}
      </section>
    </>
  );
}
