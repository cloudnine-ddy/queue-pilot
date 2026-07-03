let ioServer;

function queueRoom(eventId, facultyId) {
  return `event:${eventId}:faculty:${facultyId}`;
}

function ticketRoom(token) {
  return `ticket:${token}`;
}

export function initializeRealtime(io) {
  ioServer = io;

  // this means we set an alarm call "connection" (which is an event name, and this is a standard event name in socket.io) to listen to the socket.io server
  // when we have socket.connect() at frontend, it will trigger this "connection" event, and then we will run the function below
  // it will take the things passed inside () and use them to do something following the {}
  io.on('connection', (socket) => {
    // we announce that 'server:ready' to that socket with the 'connected' status
    socket.emit('server:ready', { status: 'connected' });

    // and then we set some more alarms to listen to the socket
    // when it send us something, we join them into the room
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
