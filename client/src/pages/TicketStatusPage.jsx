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
      <main className="brand-page">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading ticket...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="brand-page">
      <div className="brand-shell max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-6">
          <p className="brand-kicker">Monash Queue Pilot</p>
          <h1 className="brand-title">
            Ticket status
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Keep this page open. Your status will update when the queue changes.
          </p>
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
          <section className="brand-card p-5">
            <p className="text-sm text-slate-600">Ticket could not be loaded.</p>
            <Link
              className="brand-button-primary mt-5 inline-flex py-2"
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
