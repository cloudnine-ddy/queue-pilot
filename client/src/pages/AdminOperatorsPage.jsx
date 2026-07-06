import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  createOperator,
  getAdminFaculties,
  getAdminOperators,
  resetOperatorPassword,
  updateOperator,
} from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

function EyeIcon({ isVisible }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      {isVisible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m2 2 20 20" />
          <path d="M6.7 6.7C3.7 8.7 2 12 2 12s3.5 7 10 7c1.9 0 3.6-.6 5-1.4" />
          <path d="M9.9 4.3C10.6 4.1 11.3 4 12 4c6.5 0 10 8 10 8a16.1 16.1 0 0 1-3.1 4.1" />
        </>
      )}
    </svg>
  );
}

export function AdminOperatorsPage() {
  const { session } = useOutletContext();
  const [operators, setOperators] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [facultyId, setFacultyId] = useState('');
  const [editingOperators, setEditingOperators] = useState({});
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [resetOperator, setResetOperator] = useState(null);
  const [resetPassword, setResetPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadOperatorsPage() {
    const [operatorList, facultyList] = await Promise.all([
      getAdminOperators(session.token),
      getAdminFaculties(session.token),
    ]);
    const activeFaculties = facultyList.filter((faculty) => faculty.isActive);
    const assignedFacultyIds = new Set(operatorList.map((operator) => operator.faculty.id));
    const unassignedFaculties = activeFaculties.filter(
      (faculty) => !assignedFacultyIds.has(faculty.id)
    );

    setOperators(operatorList);
    setFaculties(activeFaculties);
    setFacultyId((currentFacultyId) =>
      unassignedFaculties.some((faculty) => faculty.id === currentFacultyId)
        ? currentFacultyId
        : unassignedFaculties[0]?.id || ''
    );
    setEditingOperators(
      Object.fromEntries(
        operatorList.map((operator) => [
          operator.id,
          {
            email: operator.email,
            facultyId: operator.faculty.id,
            name: operator.name,
          },
        ])
      )
    );
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
      setPassword('');
      setShowCreatePassword(false);
      await loadOperatorsPage();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEditOperator(operatorId, field, value) {
    setEditingOperators((currentOperators) => ({
      ...currentOperators,
      [operatorId]: {
        ...currentOperators[operatorId],
        [field]: value,
      },
    }));
  }

  async function handleSaveOperator(operatorId) {
    try {
      setError('');
      await updateOperator(operatorId, editingOperators[operatorId], session.token);
      await loadOperatorsPage();
    } catch (updateError) {
      setError(updateError.message);
    }
  }

  function handleOpenResetPassword(operator) {
    setResetOperator(operator);
    setResetPassword('');
    setShowResetPassword(false);
  }

  function handleCloseResetPassword() {
    setResetOperator(null);
    setResetPassword('');
    setShowResetPassword(false);
  }

  async function handleResetPassword(event) {
    event.preventDefault();

    if (!resetOperator) {
      return;
    }

    try {
      setError('');
      await resetOperatorPassword(resetOperator.id, resetPassword, session.token);
      handleCloseResetPassword();
    } catch (resetError) {
      setError(resetError.message);
    }
  }

  const assignedFacultyIds = new Set(operators.map((operator) => operator.faculty.id));
  const unassignedFaculties = faculties.filter((faculty) => !assignedFacultyIds.has(faculty.id));

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading operators...</p>;
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-monash-blue">
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
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
            onChange={(event) => setName(event.target.value)}
            placeholder="Operator name"
            type="text"
            value={name}
          />
          <input
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="operator@example.com"
            type="email"
            value={email}
          />
          <div className="flex min-w-0">
            <input
              className="min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              type={showCreatePassword ? 'text' : 'password'}
              value={password}
            />
            <button
              aria-label={showCreatePassword ? 'Hide password' : 'Show password'}
              className="rounded-r-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={() => setShowCreatePassword((value) => !value)}
              type="button"
            >
              <EyeIcon isVisible={showCreatePassword} />
            </button>
          </div>
          <select
            className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
            disabled={unassignedFaculties.length === 0}
            onChange={(event) => setFacultyId(event.target.value)}
            value={facultyId}
          >
            {unassignedFaculties.length > 0 ? (
              unassignedFaculties.map((faculty) => (
                <option key={faculty.id} value={faculty.id}>
                  {faculty.code} - {faculty.name}
                </option>
              ))
            ) : (
              <option value="">No unassigned faculties</option>
            )}
          </select>
          <button
            className="rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark disabled:cursor-not-allowed disabled:bg-slate-400"
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
            <table className="w-full min-w-[980px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Name</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Faculty</th>
                  <th className="px-4 py-3 font-semibold">Security</th>
                  <th className="pl-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {operators.map((operator) => {
                  const editState = editingOperators[operator.id] || {
                    email: operator.email,
                    facultyId: operator.faculty.id,
                    name: operator.name,
                  };
                  const availableFaculties = [
                    operator.faculty,
                    ...unassignedFaculties.filter((faculty) => faculty.id !== operator.faculty.id),
                  ];

                  return (
                    <tr className="border-b border-slate-100 last:border-0" key={operator.id}>
                      <td className="py-4 pr-4">
                        <input
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                          onChange={(event) =>
                            handleEditOperator(operator.id, 'name', event.target.value)
                          }
                          value={editState.name}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <input
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                          onChange={(event) =>
                            handleEditOperator(operator.id, 'email', event.target.value)
                          }
                          type="email"
                          value={editState.email}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <select
                          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                          onChange={(event) =>
                            handleEditOperator(operator.id, 'facultyId', event.target.value)
                          }
                          value={editState.facultyId}
                        >
                          {availableFaculties.map((faculty) => (
                            <option key={faculty.id} value={faculty.id}>
                              {faculty.code} - {faculty.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <button
                          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={() => handleOpenResetPassword(operator)}
                          type="button"
                        >
                          Reset password
                        </button>
                      </td>
                      <td className="pl-4 py-4 text-right">
                        <button
                          className="rounded-md bg-monash-blue px-3 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark"
                          onClick={() => handleSaveOperator(operator.id)}
                          type="button"
                        >
                          Save
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No operators found.
          </p>
        )}
      </section>

      {resetOperator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-5">
          <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl">
            <div>
              <p className="text-sm font-medium text-slate-500">Reset password</p>
              <h2 className="mt-1 text-xl font-semibold text-slate-950">
                {resetOperator.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600">{resetOperator.email}</p>
            </div>

            <form className="mt-5" onSubmit={handleResetPassword}>
              <label className="block text-sm font-medium text-slate-700" htmlFor="reset-password">
                New password
              </label>
              <div className="mt-2 flex">
                <input
                  className="min-w-0 flex-1 rounded-l-md border border-r-0 border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                  id="reset-password"
                  onChange={(event) => setResetPassword(event.target.value)}
                  type={showResetPassword ? 'text' : 'password'}
                  value={resetPassword}
                />
                <button
                  aria-label={showResetPassword ? 'Hide password' : 'Show password'}
                  className="rounded-r-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowResetPassword((value) => !value)}
                  type="button"
                >
                  <EyeIcon isVisible={showResetPassword} />
                </button>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  onClick={handleCloseResetPassword}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark disabled:cursor-not-allowed disabled:bg-slate-400"
                  disabled={!resetPassword}
                  type="submit"
                >
                  Reset password
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

