import 'dotenv/config';
import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { eventsRouter } from './modules/events/events.routes.js';
import { facultiesRouter } from './modules/faculties/faculties.routes.js';
import { operatorsRouter } from './modules/operators/operators.routes.js';
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
app.use('/api', operatorsRouter);
app.use('/api', ticketsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error.';

  res.status(statusCode).json({ message });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: clientUrl
  }
});

io.on('connection', (socket) => {
  socket.emit('server:ready', { status: 'connected' });
});

server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
