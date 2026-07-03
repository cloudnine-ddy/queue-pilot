import { useEffect, useState } from 'react';
import {
  createTicket,
  getActiveEvent,
  getEventFaculties,
  getTicketByToken,
} from '../api/publicApi.js';
import { socket } from '../api/realtimeClient.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { FacultyTicketForm } from '../components/FacultyTicketForm.jsx';
import { TicketStatusCard } from '../components/TicketStatusCard.jsx';

// ticketTokenKey is the variable name here, in the local storage, 'queuePilot.ticketToken' is the key, which help us to find the value
const ticketTokenKey = 'queuePilot.ticketToken';

export function PublicQueuePage() {
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

  useEffect(() => {
    if (!ticket?.token) {
      return undefined;
    }

    function joinTicketRoom() {
      socket.emit('ticket:join', { token: ticket.token });
    }

    async function handleTicketUpdated() {
      try {
        const refreshedTicket = await getTicketByToken(ticket.token);
        setTicket(refreshedTicket);
      } catch (socketError) {
        setError(socketError.message);
      }
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', joinTicketRoom);
    socket.on('server:ready', joinTicketRoom);
    socket.on('ticket:updated', handleTicketUpdated);
    joinTicketRoom();

    return () => {
      socket.off('connect', joinTicketRoom);
      socket.off('server:ready', joinTicketRoom);
      socket.off('ticket:updated', handleTicketUpdated);
    };
  }, [ticket?.token]);

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

        <AlertMessage message={error} />

        {ticket ? (
          <TicketStatusCard
            isSubmitting={isSubmitting}
            onRefresh={handleRefreshTicket}
            onReset={handleResetTicket}
            ticket={ticket}
          />
        ) : (
          <FacultyTicketForm
            faculties={faculties}
            isSubmitting={isSubmitting}
            onChangeFaculty={setSelectedFacultyId}
            onSubmit={handleCreateTicket}
            selectedFacultyId={selectedFacultyId}
          />
        )}
      </div>
    </main>
  );
}
