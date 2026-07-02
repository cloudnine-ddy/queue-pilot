import { request } from './client.js';

export async function callNextTicket(eventId, facultyId) {
  const data = await request(`/api/operator/events/${eventId}/faculties/${facultyId}/call-next`, {
    method: 'POST',
  });

  return data.ticket;
}
