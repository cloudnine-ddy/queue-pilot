import { useEffect, useState } from 'react';
import {
  createTicket,
  getActiveEvent,
  getEventFaculties,
  getTicketByToken,
} from './api.js';

const ticketTokenKey = 'queuePilot.ticketToken';

function App() {
  const [event, setEvent] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadEventForm() {
    const activeEvent = await getActiveEvent();
    const eventFaculties = await getEventFaculties(activeEvent.id);

    setEvent(activeEvent);
    setFaculties(eventFaculties);
    setSelectedFacultyId(eventFaculties[0]?.id || '');
  }

  useEffect(() => {
    async function loadInitialState() {
      try {
        setIsLoading(true);
        setError('');

        const storedToken = localStorage.getItem(ticketTokenKey);

        if (storedToken) {
          const restoredTicket = await getTicketByToken(storedToken);
          setTicket(restoredTicket);
          setEvent(restoredTicket.event);
          return;
        }

        await loadEventForm();
      } catch (initialError) {
        localStorage.removeItem(ticketTokenKey);

        try {
          await loadEventForm();
          setError(initialError.message);
        } catch (fallbackError) {
          setError(fallbackError.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialState();
  }, []);

  async function handleCreateTicket(formEvent) {
    formEvent.preventDefault();

    if (!selectedFacultyId || !event?.id) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const createdTicket = await createTicket(event.id, selectedFacultyId);
      const ticketWithStatus = await getTicketByToken(createdTicket.token);

      localStorage.setItem(ticketTokenKey, createdTicket.token);
      setTicket(ticketWithStatus);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRefreshTicket() {
    if (!ticket?.token) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const refreshedTicket = await getTicketByToken(ticket.token);
      setTicket(refreshedTicket);
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetTicket() {
    localStorage.removeItem(ticketTokenKey);
    setTicket(null);
    setSelectedFacultyId('');
    setFaculties([]);

    try {
      setIsLoading(true);
      setError('');

      await loadEventForm();
    } catch (resetError) {
      setError(resetError.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading queue...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Queue Pilot
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            {event?.name || 'Queue'}
          </h1>
        </header>

        {error && (
          <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        {ticket ? (
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
                onClick={handleRefreshTicket}
                type="button"
              >
                Refresh status
              </button>
              <button
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
                disabled={isSubmitting}
                onClick={handleResetTicket}
                type="button"
              >
                Take another number
              </button>
            </div>
          </section>
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <form onSubmit={handleCreateTicket}>
              <label className="block text-sm font-medium text-slate-700" htmlFor="faculty">
                Faculty
              </label>
              <select
                className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                id="faculty"
                onChange={(selectEvent) => setSelectedFacultyId(selectEvent.target.value)}
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
        )}
      </div>
    </main>
  );
}

export default App;
