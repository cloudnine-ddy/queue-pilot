import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  abandonTicket,
  getTicketByToken,
} from '../api/publicApi.js';
import { socket } from '../api/realtimeClient.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { TicketStatusCard } from '../components/TicketStatusCard.jsx';
import { isActiveTicketStatus } from '../constants/ticketStatus.js';

const ticketTokenKey = 'queuePilot.ticketToken';

export function TicketStatusPage() {
  const { token } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadTicket() {
    const refreshedTicket = await getTicketByToken(token);
    setTicket(refreshedTicket);

    if (isActiveTicketStatus(refreshedTicket.status)) {
      localStorage.setItem(ticketTokenKey, token);
    } else {
      localStorage.removeItem(ticketTokenKey);
    }
  }

  useEffect(() => {
    async function loadInitialTicket() {
      try {
        setIsLoading(true);
        setError('');
        await loadTicket();
      } catch (loadError) {
        localStorage.removeItem(ticketTokenKey);
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialTicket();
  }, [token]);

  useEffect(() => {
    if (!ticket?.token || !ticket?.event?.id || !ticket?.faculty?.id) {
      return undefined;
    }

    const queuePayload = {
      eventId: ticket.event.id,
      facultyId: ticket.faculty.id,
    };

    function joinRooms() {
      socket.emit('ticket:join', { token: ticket.token });
      socket.emit('queue:join', queuePayload);
    }

    async function handleRealtimeUpdate() {
      try {
        await loadTicket();
      } catch (socketError) {
        setError(socketError.message);
      }
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', joinRooms);
    socket.on('server:ready', joinRooms);
    socket.on('ticket:updated', handleRealtimeUpdate);
    socket.on('queue:updated', handleRealtimeUpdate);
    joinRooms();

    return () => {
      socket.emit('queue:leave', queuePayload);
      socket.off('connect', joinRooms);
      socket.off('server:ready', joinRooms);
      socket.off('ticket:updated', handleRealtimeUpdate);
      socket.off('queue:updated', handleRealtimeUpdate);
    };
  }, [ticket?.token, ticket?.event?.id, ticket?.faculty?.id]);

  async function handleRefreshTicket() {
    try {
      setIsSubmitting(true);
      setError('');
      await loadTicket();
    } catch (refreshError) {
      setError(refreshError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAbandonTicket() {
    if (!ticket?.token) {
      return;
    }

    const confirmed = window.confirm(`Abandon ticket ${ticket.ticketNumber}?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      const abandonedTicket = await abandonTicket(ticket.token);
      localStorage.removeItem(ticketTokenKey);
      setTicket(abandonedTicket);
    } catch (abandonError) {
      setError(abandonError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading ticket...</p>
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
            Ticket status
          </h1>
        </header>

        <AlertMessage message={error} />

        {ticket ? (
          <TicketStatusCard
            isSubmitting={isSubmitting}
            onAbandon={handleAbandonTicket}
            onRefresh={handleRefreshTicket}
            ticket={ticket}
          />
        ) : (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-600">Ticket could not be loaded.</p>
            <Link
              className="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              to="/"
            >
              Back to queue
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
