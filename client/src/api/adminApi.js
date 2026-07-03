import { request } from './client.js';

function authHeaders(token) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getAdminProfile(token) {
  const data = await request('/api/admin/me', {
    headers: authHeaders(token),
  });

  return data.admin;
}

export async function getAdminOverview(token) {
  return request('/api/admin/overview', {
    headers: authHeaders(token),
  });
}

export async function endEvent(eventId, token) {
  const data = await request(`/api/admin/events/${eventId}/end`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return data.event;
}

export async function createEvent(name, token) {
  const data = await request('/api/admin/events', {
    method: 'POST',
    headers: authHeaders(token),
    body: { name },
  });

  return data.event;
}

export async function getAdminFaculties(token) {
  const data = await request('/api/admin/faculties', {
    headers: authHeaders(token),
  });

  return data.faculties;
}

export async function createFaculty({ name, code }, token) {
  const data = await request('/api/admin/faculties', {
    method: 'POST',
    headers: authHeaders(token),
    body: { name, code },
  });

  return data.faculty;
}

export async function updateFaculty(facultyId, changes, token) {
  const data = await request(`/api/admin/faculties/${facultyId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: changes,
  });

  return data.faculty;
}
