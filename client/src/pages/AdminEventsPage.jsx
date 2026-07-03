import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import {
  createEvent,
  endEvent,
  getAdminEvents,
  getAdminFaculties,
  startEvent,
} from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

function toDateTimeLocalValue(date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16);
}

export function AdminEventsPage() {
  const { session } = useOutletContext();
  const [events, setEvents] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [eventName, setEventName] = useState('');
  const [startAt, setStartAt] = useState(() => toDateTimeLocalValue(new Date()));
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadEventsPage() {
    const [eventList, facultyList] = await Promise.all([
      getAdminEvents(session.token),
      getAdminFaculties(session.token),
    ]);
    const activeFaculties = facultyList.filter((faculty) => faculty.isActive);

    setEvents(eventList);
    setFaculties(activeFaculties);
    setSelectedFacultyIds((currentIds) =>
      currentIds.length > 0 ? currentIds : activeFaculties.map((faculty) => faculty.id)
    );
  }

  useEffect(() => {
    async function loadPage() {
      try {
        setIsLoading(true);
        setError('');
        await loadEventsPage();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPage();
  }, [session.token]);

  async function handleCreateEvent(formEvent) {
    formEvent.preventDefault();

    try {
      setIsSubmitting(true);
      setError('');
      await createEvent(
        {
          facultyIds: selectedFacultyIds,
          name: eventName,
          startAt,
        },
        session.token
      );
      setEventName('');
      await loadEventsPage();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleStartEvent(event) {
    try {
      setError('');
      await startEvent(event.id, session.token);
      await loadEventsPage();
    } catch (startError) {
      setError(startError.message);
    }
  }

  async function handleEndEvent(event) {
    const confirmed = window.confirm(`End ${event.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      await endEvent(event.id, session.token);
      await loadEventsPage();
    } catch (endError) {
      setError(endError.message);
    }
  }

  function handleToggleFaculty(facultyId) {
    setSelectedFacultyIds((currentIds) =>
      currentIds.includes(facultyId)
        ? currentIds.filter((id) => id !== facultyId)
        : [...currentIds, facultyId]
    );
  }

  const activeEvent = events.find((event) => event.status === 'ACTIVE');

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading events...</p>;
  }

  return (
    <>
      <header className="mb-8 border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Events
        </h1>
      </header>

      <AlertMessage message={error} />

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <p className="text-sm font-medium text-slate-500">Create event</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Schedule upcoming event
          </h2>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleCreateEvent}>
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <input
              className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              onChange={(inputEvent) => setEventName(inputEvent.target.value)}
              placeholder="Monash Open Day August"
              type="text"
              value={eventName}
            />
            <input
              className="min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              onChange={(inputEvent) => setStartAt(inputEvent.target.value)}
              type="datetime-local"
              value={startAt}
            />
            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={
                isSubmitting ||
                !eventName.trim() ||
                !startAt ||
                selectedFacultyIds.length === 0
              }
              type="submit"
            >
              {isSubmitting ? 'Creating...' : 'Create upcoming'}
            </button>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-slate-700">Faculty queues</p>
              <span className="text-sm font-medium text-slate-500">
                {selectedFacultyIds.length} selected
              </span>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {faculties.map((faculty) => (
                <label
                  className="flex items-start gap-3 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                  key={faculty.id}
                >
                  <input
                    checked={selectedFacultyIds.includes(faculty.id)}
                    className="mt-1"
                    onChange={() => handleToggleFaculty(faculty.id)}
                    type="checkbox"
                  />
                  <span>
                    <span className="block font-semibold text-slate-950">{faculty.name}</span>
                    <span className="mt-1 block text-xs text-slate-500">{faculty.code}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Event list</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Scheduled and past events
            </h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {events.length} events
          </span>
        </div>

        {events.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 text-right font-semibold">Faculties</th>
                  <th className="px-4 py-3 text-right font-semibold">Tickets</th>
                  <th className="pl-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr className="border-b border-slate-100 last:border-0" key={event.id}>
                    <td className="py-4 pr-4 font-semibold text-slate-950">
                      {event.name}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        {event.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-700">
                      {new Date(event.startAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {event.facultyCount}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {event.ticketCount}
                    </td>
                    <td className="pl-4 py-4 text-right">
                      <Link
                        className="mr-2 inline-flex rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                        to={`/admin/events/${event.id}`}
                      >
                        View
                      </Link>
                      {event.status === 'UPCOMING' && (
                        <button
                          className="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                          disabled={Boolean(activeEvent)}
                          onClick={() => handleStartEvent(event)}
                          type="button"
                        >
                          Start
                        </button>
                      )}
                      {event.status === 'ACTIVE' && (
                        <button
                          className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => handleEndEvent(event)}
                          type="button"
                        >
                          End
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No events found.
          </p>
        )}
      </section>
    </>
  );
}
