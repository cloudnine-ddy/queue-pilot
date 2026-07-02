const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Request failed.');
  }

  return data;
}

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
