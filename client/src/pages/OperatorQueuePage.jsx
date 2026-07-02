import { useEffect, useState } from 'react';
import { callNextTicket } from '../api/operatorApi.js';
import { getActiveEvent, getEventFaculties } from '../api/publicApi.js';
import { AlertMessage } from '../components/AlertMessage.jsx';
import { OperatorCallPanel } from '../components/OperatorCallPanel.jsx';

export function OperatorQueuePage() {
  const [event, setEvent] = useState(null);
  const [faculties, setFaculties] = useState([]);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [calledTicket, setCalledTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOperatorData() {
      try {
        setIsLoading(true);
        setError('');

        const activeEvent = await getActiveEvent();
        const eventFaculties = await getEventFaculties(activeEvent.id);

        setEvent(activeEvent);
        setFaculties(eventFaculties);
        setSelectedFacultyId(eventFaculties[0]?.id || '');
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadOperatorData();
  }, []);

  async function handleCallNext(formEvent) {
    formEvent.preventDefault();

    if (!event?.id || !selectedFacultyId) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const ticket = await callNextTicket(event.id, selectedFacultyId);
      setCalledTicket(ticket);
    } catch (callError) {
      setCalledTicket(null);
      setError(callError.message);
    } finally {
      setIsSubmitting(false);
    }
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
        </header>

        <AlertMessage message={error} />

        <OperatorCallPanel
          calledTicket={calledTicket}
          faculties={faculties}
          isSubmitting={isSubmitting}
          onCallNext={handleCallNext}
          onChangeFaculty={setSelectedFacultyId}
          selectedFacultyId={selectedFacultyId}
        />
      </div>
    </main>
  );
}
