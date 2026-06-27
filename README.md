# Queue Pilot

Queue Pilot is a monorepo for a real-time queue management system intended for event-based counselling or open-day operations.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express
- Realtime: Socket.io
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT
- Email: Resend
- Deployment target: Railway

## Project Structure

```txt
queue-pilot/
  client/   # React frontend
  server/   # Express backend
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run frontend and backend together:

```bash
npm run dev
```

Run one side only:

```bash
npm run dev:client
npm run dev:server
```

## Notes

This repository is currently only scaffolded. Business features, database schema, API routes, authentication, and queue logic are intentionally left for later development.
