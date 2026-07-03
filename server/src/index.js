import 'dotenv/config';
import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { authRouter } from './modules/auth/auth.routes.js';
import { eventsRouter } from './modules/events/events.routes.js';
import { facultiesRouter } from './modules/faculties/faculties.routes.js';
import { operatorsRouter } from './modules/operators/operators.routes.js';
import { initializeRealtime } from './modules/realtime/realtime.service.js';
import { ticketsRouter } from './modules/tickets/tickets.routes.js';

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(helmet());
app.use(cors({ origin: clientUrl }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', eventsRouter);
app.use('/api', facultiesRouter);
app.use('/api', authRouter);
app.use('/api', operatorsRouter);
app.use('/api', ticketsRouter);



// this is the error handler, all of the errors will be passed to this middleware
app.use((err, _req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error.';

  res.status(statusCode).json({ message });
});


// this make our 'app' become a server
// so that socket.io can listen to the same port as our express server
const server = http.createServer(app);

// this is the socket.io server, it will listen to the same port as our express server
// 'io' is the name of the socket.io server
// we write new Server() to initialize the socket.io server, and we pass the 'server' which refer to the express server
// it's like telling the socket.io server that:
// "hey, you gonna listen to this 'server'(express server) with the same port"
// so the servers here means differently
const io = new Server(server, {
  // cors means Cross-Origin Resource Sharing
  // basically is allowing the client to connect to this server without stopping them (because they are from different ports)
  cors: {
    origin: clientUrl
  }
});

initializeRealtime(io);

// this starts the server and listens to the specified port (make the computer listen to the port, the server)
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
