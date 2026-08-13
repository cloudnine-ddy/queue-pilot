import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  callNextTicket,
  completeTicket,
  getCalledTickets,
  getWaitingTickets,
  skipTicket,
} from '../api/operatorApi.js';
import { getActiveEvent } from '../api/publicApi.js';
import { socket } from '../api/realtimeClient.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { ConfirmDialog } from '../components/ConfirmDialog.jsx';
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
    <section className="brand-card p-6 sm:p-7">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-monash-blue-soft text-xl text-monash-blue">
        i
      </div>
      <h2 className="section-title mt-5">{title}</h2>
      <p className="mt-2 text-[15px] leading-6 text-slate-600">{message}</p>
      <button
        className="brand-button-secondary mt-5"
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
  const [calledTickets, setCalledTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [pendingTicketId, setPendingTicketId] = useState('');
  const [ticketToSkip, setTicketToSkip] = useState(null);
  const [queueAccessError, setQueueAccessError] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function refreshOperatorTickets(eventId, token) {
      const [waiting, called] = await Promise.all([
        getWaitingTickets(eventId, token),
        getCalledTickets(eventId, token),
      ]);

      setWaitingTickets(waiting);
      setCalledTickets(called);
    }

    async function loadOperatorData() {
      if (!session?.token) {
        return;
      }

      let activeEvent = null;

      try {
        setIsLoading(true);
        setError('');
        setNotice('');
        setQueueAccessError('');

        activeEvent = await getActiveEvent();
        setEvent(activeEvent);

        await refreshOperatorTickets(activeEvent.id, session.token);
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
        const [waiting, called] = await Promise.all([
          getWaitingTickets(event.id, session.token),
          getCalledTickets(event.id, session.token),
        ]);

        setQueueAccessError('');
        setWaitingTickets(waiting);
        setCalledTickets(called);
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
      setNotice('');
      setPendingAction('call');

      const calledTicket = await callNextTicket(event.id, session.token);
      const [waiting, called] = await Promise.all([
        getWaitingTickets(event.id, session.token),
        getCalledTickets(event.id, session.token),
      ]);

      setWaitingTickets(waiting);
      setCalledTickets(called);
      setNotice(`${calledTicket.ticketNumber} is now being called.`);
    } catch (callError) {
      setError(callError.message);
    } finally {
      setIsSubmitting(false);
      setPendingAction('');
    }
  }

  async function handleCompleteTicket(ticket) {
    if (!ticket?.id || !session?.token || !event?.id) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setNotice('');
      setPendingAction('done');
      setPendingTicketId(ticket.id);

      await completeTicket(ticket.id, session.token);
      const called = await getCalledTickets(event.id, session.token);

      setCalledTickets(called);
      setNotice(`${ticket.ticketNumber} marked as done.`);
    } catch (completeError) {
      setError(completeError.message);
    } finally {
      setIsSubmitting(false);
      setPendingAction('');
      setPendingTicketId('');
    }
  }

  async function handleSkipTicket(ticket = ticketToSkip) {
    if (!ticket?.id || !session?.token || !event?.id) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      setNotice('');
      setPendingAction('skip');
      setPendingTicketId(ticket.id);

      await skipTicket(ticket.id, session.token);
      const called = await getCalledTickets(event.id, session.token);

      setCalledTickets(called);
      setTicketToSkip(null);
      setNotice(`${ticket.ticketNumber} skipped.`);
    } catch (skipError) {
      setError(skipError.message);
    } finally {
      setIsSubmitting(false);
      setPendingAction('');
      setPendingTicketId('');
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
      <main className="brand-page">
        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading operator queue...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="brand-page">
      <div className="brand-shell max-w-5xl">
        <header className="app-header">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="brand-kicker">Operator console</p>
              <h1 className="brand-title">{event?.name || 'Queue'}</h1>
            </div>
            <button
              aria-label="Sign out"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600 hover:bg-monash-blue-soft hover:text-monash-blue"
              onClick={handleSignOut}
              type="button"
            >
              <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="m16 17 5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-[#f4f5f8] p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Faculty queue</p>
              <p className="mt-1 text-[15px] font-semibold text-monash-ink">{session.operator.faculty.name}</p>
            </div>
            <p className="text-sm text-slate-500">
              Signed in as <span className="font-semibold text-slate-700">{session.operator.name}</span>
            </p>
          </div>
          {event?.scheduledEndAt && (
            <p className="mt-3 text-sm text-slate-500">
              Scheduled end {new Date(event.scheduledEndAt).toLocaleString()}
            </p>
          )}
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
            {notice && (
              <div className="mb-5 rounded-2xl bg-monash-blue-soft px-4 py-3.5 text-sm font-medium text-monash-blue">
                {notice}
              </div>
            )}
            <OperatorCallPanel
              calledTickets={calledTickets}
              faculty={session.operator.faculty}
              isSubmitting={isSubmitting}
              onCallNext={handleCallNext}
              onComplete={handleCompleteTicket}
              onSkip={setTicketToSkip}
              pendingAction={pendingAction}
              pendingTicketId={pendingTicketId}
              waitingTickets={waitingTickets}
            />
            <ConfirmDialog
              confirmLabel="Skip ticket"
              intent="danger"
              isOpen={Boolean(ticketToSkip)}
              message={
                ticketToSkip
                  ? `${ticketToSkip.ticketNumber} will be marked as skipped. The parent will see the updated status.`
                  : ''
              }
              onCancel={() => setTicketToSkip(null)}
              onConfirm={() => handleSkipTicket()}
              title="Skip this ticket?"
            />
          </>
        )}
      </div>
    </main>
  );
}
