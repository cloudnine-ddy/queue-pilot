const adminSessionKey = 'queuePilot.adminSession';

export function readAdminSession() {
  const storedSession = localStorage.getItem(adminSessionKey);

  if (!storedSession) {
    return null;
  }

  try {
    return JSON.parse(storedSession);
  } catch {
    localStorage.removeItem(adminSessionKey);
    return null;
  }
}

export function clearAdminSession() {
  localStorage.removeItem(adminSessionKey);
}

export { adminSessionKey };
