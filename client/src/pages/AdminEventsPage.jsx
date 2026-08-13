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
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';

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
  const [scheduledEndAt, setScheduledEndAt] = useState('');
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventToEnd, setEventToEnd] = useState(null);
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
          scheduledEndAt: scheduledEndAt || null,
          startAt,
        },
        session.token
      );
      setEventName('');
      setScheduledEndAt('');
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

  async function handleEndEvent() {
    if (!eventToEnd) {
      return;
    }

    try {
      setError('');
      await endEvent(eventToEnd.id, session.token);
      setEventToEnd(null);
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
  const upcomingCount = events.filter((event) => event.status === 'UPCOMING').length;
  const endedCount = events.filter((event) => event.status === 'ENDED').length;
  const filteredEvents =
    statusFilter === 'ALL'
      ? events
      : events.filter((event) => event.status === statusFilter);

  if (isLoading) {
    return <p className="text-sm font-medium text-slate-600">Loading events...</p>;
  }

  return (
    <>
      <header className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-monash-blue">
          Admin
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
          Events
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-6 text-slate-600">
          Prepare upcoming events, monitor the active event and open summaries for completed events.
        </p>
      </header>

      <AlertMessage message={error} />

      <section className="brand-card p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-eyebrow">Current event</p>
            <h2 className="section-title">
              {activeEvent ? activeEvent.name : 'No active event'}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {activeEvent
                ? `Started ${new Date(activeEvent.startAt).toLocaleString()}`
                : 'Start an upcoming event when queues are ready to open.'}
            </p>
            {activeEvent?.scheduledEndAt && (
              <p className="mt-1 text-sm text-slate-600">
                Scheduled end {new Date(activeEvent.scheduledEndAt).toLocaleString()}
              </p>
            )}
          </div>

          {activeEvent && (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                className="inline-flex justify-center rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark"
                to={`/admin/events/${activeEvent.id}`}
              >
                View queue
              </Link>
              <button
                className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                onClick={() => setEventToEnd(activeEvent)}
                type="button"
              >
                End event
              </button>
            </div>
          )}
        </div>

        {activeEvent && (
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Status</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {activeEvent.status}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Faculties</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {activeEvent.facultyCount}
              </dd>
            </div>
            <div className="rounded-md bg-slate-50 p-4">
              <dt className="text-sm font-medium text-slate-500">Tickets</dt>
              <dd className="mt-1 text-base font-semibold text-slate-950">
                {activeEvent.ticketCount}
              </dd>
            </div>
          </dl>
        )}
      </section>

      <section className="brand-card mt-6 p-6 sm:p-7">
        <div>
          <p className="section-eyebrow">Create event</p>
          <h2 className="section-title">
            Schedule upcoming event
          </h2>
        </div>

        <form className="mt-5 space-y-5" onSubmit={handleCreateEvent}>
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_220px_auto]">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Event name</span>
              <input
                className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                onChange={(inputEvent) => setEventName(inputEvent.target.value)}
                placeholder="Monash Open Day August"
                type="text"
                value={eventName}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Start</span>
              <input
                className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                onChange={(inputEvent) => setStartAt(inputEvent.target.value)}
                type="datetime-local"
                value={startAt}
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Scheduled end</span>
              <input
                className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 py-2 text-base text-slate-950 outline-none focus:border-monash-blue focus:ring-2 focus:ring-monash-blue/15"
                onChange={(inputEvent) => setScheduledEndAt(inputEvent.target.value)}
                type="datetime-local"
                value={scheduledEndAt}
              />
            </label>
            <button
              className="self-end rounded-md bg-monash-blue px-4 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark disabled:cursor-not-allowed disabled:bg-slate-400"
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
              {faculties.map((faculty) => {
                const isSelected = selectedFacultyIds.includes(faculty.id);

                return (
                  <button
                    aria-pressed={isSelected}
                    className={`min-h-20 rounded-md border px-3 py-3 text-left transition ${
                      isSelected
                        ? 'border-monash-blue bg-monash-blue-soft text-monash-ink'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-monash-blue hover:bg-slate-50'
                    }`}
                    key={faculty.id}
                    onClick={() => handleToggleFaculty(faculty.id)}
                    type="button"
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="block text-[15px] font-semibold">{faculty.name}</span>
                        <span className="mt-1 block text-sm text-slate-500">{faculty.code}</span>
                      </span>
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          isSelected
                            ? 'border-monash-blue bg-monash-blue text-white'
                            : 'border-slate-300 bg-white text-transparent'
                        }`}
                      >
                        <svg
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          viewBox="0 0 24 24"
                        >
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </form>
      </section>

      <section className="brand-card mt-6 p-6 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="section-eyebrow">Event list</p>
            <h2 className="section-title">
              Scheduled and past events
            </h2>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {['ALL', 'ACTIVE', 'UPCOMING', 'ENDED'].map((status) => (
              <button
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  statusFilter === status
                    ? 'border-monash-blue bg-monash-blue text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:border-monash-blue hover:text-monash-blue'
                }`}
                key={status}
                onClick={() => setStatusFilter(status)}
                type="button"
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          {upcomingCount} upcoming / {endedCount} ended
        </p>

        {filteredEvents.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-[15px]">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 pr-4 font-semibold">Event</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Start</th>
                  <th className="px-4 py-3 font-semibold">Scheduled end</th>
                  <th className="px-4 py-3 text-right font-semibold">Faculties</th>
                  <th className="px-4 py-3 text-right font-semibold">Tickets</th>
                  <th className="pl-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => (
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
                    <td className="px-4 py-4 text-slate-700">
                      {event.scheduledEndAt
                        ? new Date(event.scheduledEndAt).toLocaleString()
                        : 'Not set'}
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
                        {event.status === 'ENDED' ? 'Summary' : 'View'}
                      </Link>
                      {event.status === 'UPCOMING' && (
                        <button
                          className="rounded-md bg-monash-blue px-3 py-2 text-sm font-semibold text-white hover:bg-monash-blue-dark disabled:cursor-not-allowed disabled:bg-slate-400"
                          disabled={Boolean(activeEvent)}
                          onClick={() => handleStartEvent(event)}
                          type="button"
                        >
                          Start
                        </button>
                      )}
                      {event.status === 'ACTIVE' && (
                        <span className="inline-flex rounded-md bg-emerald-50 px-3 py-2 text-sm font-semibold text-monash-blue">
                          Current
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-5 rounded-md bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No events match this filter.
          </p>
        )}
      </section>

      <ConfirmDialog
        confirmLabel="End event"
        intent="danger"
        isOpen={Boolean(eventToEnd)}
        message={
          eventToEnd
            ? `${eventToEnd.name} will be ended now and its summary will be generated.`
            : ''
        }
        onCancel={() => setEventToEnd(null)}
        onConfirm={handleEndEvent}
        title="End this event?"
      />
    </>
  );
}

