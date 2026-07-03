import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  createEvent,
  endEvent,
  getAdminOverview,
} from '../api/adminApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';

export function AdminEventsPage() {
  const { session } = useOutletContext();
  const [overview, setOverview] = useState(null);
  const [eventName, setEventName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [isEndingEvent, setIsEndingEvent] = useState(false);
  const [error, setError] = useState('');

  async function loadOverview() {
    const adminOverview = await getAdminOverview(session.token);
    setOverview(adminOverview);
  }

  useEffect(() => {
    async function loadEventsPage() {
      try {
        setIsLoading(true);
        setError('');
        await loadOverview();
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadEventsPage();
  }, [session.token]);

  async function handleEndEvent() {
    if (!event?.id) {
      return;
    }

    const confirmed = window.confirm(`End ${event.name}?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsEndingEvent(true);
      setError('');
      await endEvent(event.id, session.token);
      await loadOverview();
    } catch (endError) {
      setError(endError.message);
    } finally {
      setIsEndingEvent(false);
    }
  }

  async function handleCreateEvent(formEvent) {
    formEvent.preventDefault();

    try {
      setIsCreatingEvent(true);
      setError('');
      await createEvent(eventName, session.token);
      setEventName('');
      await loadOverview();
    } catch (createError) {
      setError(createError.message);
    } finally {
      setIsCreatingEvent(false);
    }
  }

  const event = overview?.event;
  const faculties = overview?.faculties || [];

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

      <section className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Active event</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            {event?.name || 'No active event'}
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            {event?.status || 'Unavailable'}
          </p>
          <button
            className="mt-5 w-fit rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
            disabled={!event?.id || isEndingEvent}
            onClick={handleEndEvent}
            type="button"
          >
            {isEndingEvent ? 'Ending...' : 'End event'}
          </button>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Create event</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-950">
            Add active event
          </h2>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleCreateEvent}>
            <label className="sr-only" htmlFor="event-name">
              Event name
            </label>
            <input
              className="min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:text-slate-400"
              disabled={Boolean(event) || isCreatingEvent}
              id="event-name"
              onChange={(inputEvent) => setEventName(inputEvent.target.value)}
              placeholder="Monash Open Day August"
              type="text"
              value={eventName}
            />
            <button
              className="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              disabled={Boolean(event) || isCreatingEvent || !eventName.trim()}
              type="submit"
            >
              {isCreatingEvent ? 'Creating...' : 'Create event'}
            </button>
          </form>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">Event faculties</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              Active event queues
            </h2>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
            {faculties.length} selected
          </span>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {faculties.map((faculty) => (
            <div
              className="rounded-md border border-slate-200 px-4 py-3"
              key={faculty.id}
            >
              <p className="font-semibold text-slate-950">{faculty.name}</p>
              <p className="mt-1 text-sm text-slate-500">{faculty.code}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
