import { request } from './client.js';

export async function getActiveEvent() {
  const data = await request('/api/public/events/active');
  return data.event;
}

export async function getEventFaculties(eventId) {
  const data = await request(`/api/public/events/${eventId}/faculties`);
  return data.faculties;
}

export async function createTicket(eventId, facultyId) {
  const data = await request(`/api/public/events/${eventId}/faculties/${facultyId}/tickets`, {
    method: 'POST',
  });

  return data.ticket;
}

export async function getTicketByToken(token) {
  const data = await request(`/api/public/tickets/${token}`);
  return data.ticket;
}

export async function abandonTicket(token) {
  const data = await request(`/api/public/tickets/${token}/abandon`, {
    method: 'POST',
  });

  return data.ticket;
}
