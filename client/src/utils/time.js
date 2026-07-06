export function formatElapsedTime(startedAt, now = Date.now()) {
  const startedAtTime = new Date(startedAt).getTime();

  if (!Number.isFinite(startedAtTime)) {
    return '0s';
  }

  const totalSeconds = Math.max(0, Math.floor((now - startedAtTime) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${String(seconds).padStart(2, '0')}s`;
}
