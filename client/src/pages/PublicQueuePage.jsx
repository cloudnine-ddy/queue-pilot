import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createTicket,
  getActiveEvent,
  getEventFaculties,
} from '../api/publicApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { FacultyTicketForm } from '../components/FacultyTicketForm.jsx';

// ticketTokenKey is the variable name here, in the local storage, 'queuePilot.ticketToken' is the key, which help us to find the value
const ticketTokenKey = 'queuePilot.ticketToken';

export function PublicQueuePage() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadEventForm() {
    const activeEvent = await getActiveEvent();
    const eventFaculties = await getEventFaculties(activeEvent.id);

    setEvent(activeEvent);
    setFaculties(eventFaculties);
    setSelectedFacultyId('');
  }

  useEffect(() => {
    async function loadInitialState() {
      try {
        setIsLoading(true);
        setError('');

        const storedToken = localStorage.getItem(ticketTokenKey);

        if (storedToken) {
          navigate(`/tickets/${storedToken}`, { replace: true });
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

      localStorage.setItem(ticketTokenKey, createdTicket.token);
      navigate(`/tickets/${createdTicket.token}`);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="brand-page">
        <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
          <p className="text-sm font-medium text-slate-600">Loading queue...</p>
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
            {event?.name || 'Queue'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
            Select the faculty queue you need. Your ticket status will update automatically after
            you take a number.
          </p>
        </header>

        <AlertMessage message={error} />

        <FacultyTicketForm
          faculties={faculties}
          isSubmitting={isSubmitting}
          onChangeFaculty={setSelectedFacultyId}
          onSubmit={handleCreateTicket}
          selectedFacultyId={selectedFacultyId}
        />
      </div>
    </main>
  );
}
