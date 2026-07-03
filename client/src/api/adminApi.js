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

export async function startEvent(eventId, token) {
  const data = await request(`/api/admin/events/${eventId}/start`, {
    method: 'POST',
    headers: authHeaders(token),
  });

  return data.event;
}

export async function createEvent({ facultyIds, name, startAt }, token) {
  const data = await request('/api/admin/events', {
    method: 'POST',
    headers: authHeaders(token),
    body: { facultyIds, name, startAt },
  });

  return data.event;
}

export async function getAdminEvents(token) {
  const data = await request('/api/admin/events', {
    headers: authHeaders(token),
  });

  return data.events;
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

export async function getAdminOperators(token) {
  const data = await request('/api/admin/operators', {
    headers: authHeaders(token),
  });

  return data.operators;
}

export async function createOperator({ name, email, password, facultyId }, token) {
  const data = await request('/api/admin/operators', {
    method: 'POST',
    headers: authHeaders(token),
    body: { name, email, password, facultyId },
  });

  return data.operator;
}

export async function updateOperator(operatorId, changes, token) {
  const data = await request(`/api/admin/operators/${operatorId}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: changes,
  });

  return data.operator;
}

export async function resetOperatorPassword(operatorId, password, token) {
  const data = await request(`/api/admin/operators/${operatorId}/reset-password`, {
    method: 'POST',
    headers: authHeaders(token),
    body: { password },
  });

  return data.operator;
}
