let ioServer;

function queueRoom(eventId, facultyId) {
  return `event:${eventId}:faculty:${facultyId}`;
}

function ticketRoom(token) {
  return `ticket:${token}`;
}

export function initializeRealtime(io) {
  ioServer = io;

  io.on('connection', (socket) => {
    socket.emit('server:ready', { status: 'connected' });

    socket.on('queue:join', ({ eventId, facultyId } = {}) => {
      if (!eventId || !facultyId) {
        return;
      }

      socket.join(queueRoom(eventId, facultyId));
    });

    socket.on('queue:leave', ({ eventId, facultyId } = {}) => {
      if (!eventId || !facultyId) {
        return;
      }

      socket.leave(queueRoom(eventId, facultyId));
    });

    socket.on('ticket:join', ({ token } = {}) => {
      if (!token) {
        return;
      }

      socket.join(ticketRoom(token));
    });
  });
}

export function emitQueueUpdated(eventId, facultyId) {
  if (!ioServer) {
    return;
  }

  ioServer.to(queueRoom(eventId, facultyId)).emit('queue:updated', {
    eventId,
    facultyId,
  });
}

export function emitTicketUpdated(token) {
  if (!ioServer) {
    return;
  }

  ioServer.to(ticketRoom(token)).emit('ticket:updated', { token });
}
