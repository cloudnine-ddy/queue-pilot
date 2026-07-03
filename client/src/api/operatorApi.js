import { request } from './client.js';

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getWaitingTickets(eventId, token) {
  const data = await request(`/api/operator/events/${eventId}/tickets/waiting`, {
    headers: authHeaders(token),
  });
  return data.tickets;
}

export async function callNextTicket(eventId, token) {
  const data = await request(`/api/operator/events/${eventId}/call-next`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return data.ticket;
}

export async function completeTicket(ticketId, token) {
  const data = await request(`/api/operator/tickets/${ticketId}/done`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return data.ticket;
}

export async function skipTicket(ticketId, token) {
  const data = await request(`/api/operator/tickets/${ticketId}/skip`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return data.ticket;
}
