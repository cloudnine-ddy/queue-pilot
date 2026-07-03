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
