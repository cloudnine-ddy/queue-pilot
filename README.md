# Queue Pilot

**A real-time virtual queue system for event-based counselling and open-day operations.**

Queue Pilot replaces manual visitor registration and repeated verbal calling with a shared digital flow. Visitors take a number from their phones, operators manage a faculty-specific queue, and administrators coordinate the event from a desktop workspace.

> **Project status:** Functional MVP, under active development. The Visitor, Operator, and Admin flows have been manually validated locally. A Railway deployment is configured but intentionally kept offline until a live demo is needed.

## Demo

> **Video placeholder**<br>
> A side-by-side Visitor and Operator demo is being prepared. It shows a visitor taking a number, the operator receiving the ticket in real time, the number being called, and both interfaces updating when the visit is completed.

<!--
Replace this block with a linked demo thumbnail or short looping preview.
Suggested full-demo sequence:
1. Visitor takes a number.
2. Operator receives the new ticket.
3. Operator calls the ticket.
4. Visitor status changes from Waiting to Called.
5. Operator completes the ticket and Visitor status changes to Done.
-->

| Visitor | Operator | Admin |
| --- | --- | --- |
| _Screenshot placeholder_ | _Screenshot placeholder_ | _Screenshot placeholder_ |

## Why I built it

The idea came from a manual queue process I observed while working with a university future-student team. Staff recorded visitor details, issued numbers, and repeatedly called those numbers aloud. The workflow worked, but it required constant coordination and gave visitors little visibility while they waited.

Queue Pilot explores a lighter alternative designed around that real operating context:

- visitors should not need an account or an app installation;
- operators should only manage the queue assigned to their faculty;
- queue changes should appear without manual page refreshes;
- administrators should be able to prepare events, staff them, monitor activity, and retain useful summaries.

## Core experience

### Visitor — mobile

- Select an available faculty and receive a faculty-prefixed number.
- See the current ticket status and the number of people ahead.
- Receive real-time updates when the ticket is called, completed, or skipped.
- Refresh manually if needed or abandon an active ticket.
- Return to the active ticket through a token stored in the browser.

### Operator — mobile

- Sign in to a faculty-scoped operator account.
- Receive new waiting tickets in real time.
- Call the next number and manage active calls.
- Mark a ticket as done or skipped.
- Work only within the operator's assigned faculty queue.

### Admin — desktop

- Monitor the active event and its queues from a central dashboard.
- Create and manage faculties and operator accounts.
- Create, start, schedule, and end events.
- Select which faculties participate in each event.
- Review live event detail, recent tickets, and generated event summaries.

## How the realtime flow works

```mermaid
flowchart LR
    V["Visitor mobile web"]
    O["Operator mobile console"]
    A["Admin desktop workspace"]
    API["Express REST API"]
    RT["Socket.IO rooms"]
    S["Queue and event services"]
    P["Prisma ORM"]
    DB[("PostgreSQL")]

    V --> API
    O --> API
    A --> API
    V <--> RT
    O <--> RT
    A <--> RT
    API --> S
    S --> RT
    S --> P
    P --> DB
```

REST endpoints perform state changes and remain the source of truth. Socket.IO events act as targeted update signals: connected clients receive a notification and refetch the latest queue or ticket state.

Two room types keep updates scoped to the relevant clients:

- `event:{eventId}:faculty:{facultyId}` for faculty queue changes;
- `ticket:{token}` for updates to one visitor's ticket.

## Engineering decisions

### Faculty-scoped numbering and queues

Ticket numbers are generated per event and faculty, such as `GEN-005`. Database constraints protect the sequence within that scope, while queue position is calculated from earlier tickets that are still waiting.

### Role boundaries at the API layer

Admin and Operator sessions use separate JWT claims and middleware. Operators are restricted to their assigned faculty rather than relying on the interface alone to enforce access.

### Event lifecycle and retained summaries

Events move through `UPCOMING`, `ACTIVE`, and `ENDED` states. Ending an event generates a summary with overall and faculty-level outcomes, allowing detailed operational data to be pruned later without losing the event-level result.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | React, Vite, Tailwind CSS, React Router |
| Backend | Node.js, Express |
| Realtime | Socket.IO |
| Database | PostgreSQL, Prisma ORM |
| Authentication | JWT, bcrypt |
| Security and logging | Helmet, CORS, Morgan |
| Local development | npm workspaces, Docker Compose, Prisma Studio |
| Deployment setup | Railway client, server, PostgreSQL, and persistent database storage |

## Project structure

```text
queue-pilot/
├── client/                  # React application for Visitor, Operator, and Admin interfaces
│   └── src/
│       ├── api/             # REST and Socket.IO clients
│       ├── components/      # Shared queue and interface components
│       └── pages/           # Role-specific pages and flows
├── server/
│   ├── prisma/              # Schema, migrations, and development seed data
│   └── src/
│       ├── middleware/      # Admin and Operator authentication boundaries
│       └── modules/         # Auth, events, faculties, operators, tickets, and realtime logic
├── docker-compose.yml       # Local PostgreSQL service
└── package.json             # npm workspace scripts
```

## Run locally

### Prerequisites

- A current Node.js LTS release
- npm
- Docker Desktop with Docker Compose

### 1. Install dependencies

```bash
npm install
```

### 2. Create local environment files

Copy the two examples:

```text
client/.env.example  -> client/.env
server/.env.example  -> server/.env
```

For the included Docker Compose database, the server connection string can use:

```env
DATABASE_URL=postgresql://queue_pilot:queue_pilot_password@localhost:5432/queue_pilot?schema=public
```

Replace `JWT_SECRET` with a private local value. Do not commit either `.env` file.

### 3. Start PostgreSQL and prepare the schema

```bash
docker compose up -d
npm run db:deploy
npm run seed -w server
```

The seed command creates development-only event, faculty, and account data. Review it before using the project outside a local environment.

### 4. Start the application

```bash
npm run dev
```

The default local services are:

- Client: `http://localhost:5173`
- Server: `http://localhost:4000`
- Health check: `http://localhost:4000/health`

### Useful commands

```bash
npm run dev:client        # Run only the Vite client
npm run dev:server        # Run only the Express server
npm run build             # Generate Prisma Client and build the frontend
npm run prisma:studio -w server
```

## Current limitations

- This is an MVP and is still being refined rather than a finished production service.
- Automated tests have not yet been added; the three role flows are currently validated manually.
- The configured Railway services are intentionally offline, so there is no permanent public demo URL yet.
- The current notification experience is in-browser; SMS, email, and native push notifications are not implemented.
- Production rollout, accessibility review, and broader usability testing remain future work.

## Ownership and project boundary

Queue Pilot is an independent personal project by **Ti Jia Don**. I identified the workflow problem and built the product across interface design, frontend, backend, data modelling, real-time communication, authentication, and deployment setup.

The project was inspired by firsthand observations in a university work setting. It is not an official Monash University system, has not been deployed or adopted by the university, and is not connected to official university data or services.

## License

No open-source license has been added. All rights are reserved unless a license is provided later.
