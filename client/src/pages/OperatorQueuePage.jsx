import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  callNextTicket,
  completeTicket,
  getWaitingTickets,
  skipTicket,
} from '../api/operatorApi.js';
import { getActiveEvent } from '../api/publicApi.js';
import { socket } from '../api/realtimeClient.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { OperatorCallPanel } from '../components/OperatorCallPanel.jsx';
import { operatorSessionKey } from './OperatorLoginPage.jsx';

function readOperatorSession() {
  const storedSession = localStorage.getItem(operatorSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    localStorage.removeItem(operatorSessionKey);
    return null;
  }
}

function OperatorStatePanel({ message, onSignOut, title }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>
      <button
        className="mt-5 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
        onClick={onSignOut}
        type="button"
      >
        Sign out
      </button>
    </section>
  );
}

export function OperatorQueuePage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(() => readOperatorSession());
  const [event, setEvent] = useState(null);
  const [waitingTickets, setWaitingTickets] = useState([]);
  const [calledTicket, setCalledTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queueAccessError, setQueueAccessError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOperatorData() {
      if (!session?.token) {
        return;
      }

      let activeEvent = null;

      try {
        setIsLoading(true);
        setError('');
        setQueueAccessError('');

        activeEvent = await getActiveEvent();
        setEvent(activeEvent);

        const tickets = await getWaitingTickets(activeEvent.id, session.token);

        setWaitingTickets(tickets);
      } catch (loadError) {
        if (activeEvent) {
          setQueueAccessError(loadError.message);
        } else {
          setError(loadError.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadOperatorData();
  }, [session?.token]);

  useEffect(() => {
    if (!event?.id || !session?.operator?.faculty?.id || !session?.token) {
      return undefined;
    }

    const roomPayload = {
      eventId: event.id,
      facultyId: session.operator.faculty.id,
    };

    function joinQueueRoom() {
      socket.emit('queue:join', roomPayload);
    }

    async function handleQueueUpdated(payload) {
      if (payload.eventId !== event.id || payload.facultyId !== session.operator.faculty.id) {
        return;
      }

      try {
        const tickets = await getWaitingTickets(event.id, session.token);
        setQueueAccessError('');
        setWaitingTickets(tickets);
      } catch (socketError) {
        setQueueAccessError(socketError.message);
      }
    }

    if (!socket.connected) {
      socket.connect();
    }

    socket.on('connect', joinQueueRoom);
    socket.on('server:ready', joinQueueRoom);
    socket.on('queue:updated', handleQueueUpdated);
    joinQueueRoom();

    return () => {
      socket.emit('queue:leave', roomPayload);
      socket.off('connect', joinQueueRoom);
      socket.off('server:ready', joinQueueRoom);
      socket.off('queue:updated', handleQueueUpdated);
    };
  }, [event?.id, session?.operator?.faculty?.id, session?.token]);

  async function handleCallNext(formEvent) {
    formEvent.preventDefault();

    if (!event?.id || !session?.token) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const ticket = await callNextTicket(event.id, session.token);
      const tickets = await getWaitingTickets(event.id, session.token);

      setCalledTicket(ticket);
      setWaitingTickets(tickets);
    } catch (callError) {
      setCalledTicket(null);
      setError(callError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCompleteTicket() {
    if (!calledTicket?.id || !session?.token) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const ticket = await completeTicket(calledTicket.id, session.token);
      setCalledTicket(ticket);
    } catch (completeError) {
      setError(completeError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSkipTicket() {
    if (!calledTicket?.id || !session?.token) {
      return;
    }

    const confirmed = window.confirm(`Skip ticket ${calledTicket.ticketNumber}?`);

    if (!confirmed) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const ticket = await skipTicket(calledTicket.id, session.token);
      setCalledTicket(ticket);
    } catch (skipError) {
      setError(skipError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSignOut() {
    localStorage.removeItem(operatorSessionKey);
    setSession(null);
    navigate('/operator/login');
  }

  if (!session?.token) {
    return <Navigate replace to="/operator/login" />;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading operator queue...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-8 text-slate-950">
      <div className="mx-auto max-w-3xl">
        <header className="mb-8 border-b border-slate-200 pb-5">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
            Operator
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            {event?.name || 'Queue'}
          </h1>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-semibold">{session.operator.name}</span>
            </p>
            <button
              className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              onClick={handleSignOut}
              type="button"
            >
              Sign out
            </button>
          </div>
        </header>

        {error && !event ? (
          <OperatorStatePanel
            message={error}
            onSignOut={handleSignOut}
            title="No queue available"
          />
        ) : queueAccessError ? (
          <OperatorStatePanel
            message={queueAccessError}
            onSignOut={handleSignOut}
            title="Queue access unavailable"
          />
        ) : (
          <>
            <AlertMessage message={error} />
            <OperatorCallPanel
              calledTicket={calledTicket}
              faculty={session.operator.faculty}
              isSubmitting={isSubmitting}
              onCallNext={handleCallNext}
              onComplete={handleCompleteTicket}
              onSkip={handleSkipTicket}
              waitingTickets={waitingTickets}
            />
          </>
        )}
      </div>
    </main>
  );
}
