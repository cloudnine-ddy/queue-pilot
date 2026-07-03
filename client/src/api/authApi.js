import { request } from './client.js';

export async function loginOperator(email, password) {
  return request('/api/auth/operator/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function loginAdmin(email, password) {
  return request('/api/auth/admin/login', {
    method: 'POST',
    body: { email, password },
  });
}
