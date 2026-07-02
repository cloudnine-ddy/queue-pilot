import { request } from './client.js';

export async function getWaitingTickets(eventId, facultyId) {
  const data = await request(`/api/operator/events/${eventId}/faculties/${facultyId}/tickets/waiting`);
  return data.tickets;
}

export async function callNextTicket(eventId, facultyId) {
  const data = await request(`/api/operator/events/${eventId}/faculties/${facultyId}/call-next`, {
    method: 'POST',
  });

  return data.ticket;
}

export async function completeTicket(ticketId) {
  const data = await request(`/api/operator/tickets/${ticketId}/done`, {
    method: 'POST',
  });

  return data.ticket;
}

export async function skipTicket(ticketId) {
  const data = await request(`/api/operator/tickets/${ticketId}/skip`, {
    method: 'POST',
  });

  return data.ticket;
}
