-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('upcoming', 'active', 'ended');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('waiting', 'called', 'done', 'skipped');

-- CreateTable
CREATE TABLE "faculties" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,

    CONSTRAINT "faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'upcoming',
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_faculties" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,

    CONSTRAINT "event_faculties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operators" (
    "id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "operators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_tickets" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "faculty_id" TEXT NOT NULL,
    "ticket_number" TEXT NOT NULL,
    "sequence_number" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "status" "TicketStatus" NOT NULL DEFAULT 'waiting',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "called_at" TIMESTAMP(3),

    CONSTRAINT "queue_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "faculties_code_key" ON "faculties"("code");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "event_faculties_faculty_id_idx" ON "event_faculties"("faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "event_faculties_event_id_faculty_id_key" ON "event_faculties"("event_id", "faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "operators_faculty_id_key" ON "operators"("faculty_id");

-- CreateIndex
CREATE UNIQUE INDEX "operators_email_key" ON "operators"("email");

-- CreateIndex
CREATE UNIQUE INDEX "queue_tickets_token_key" ON "queue_tickets"("token");

-- CreateIndex
CREATE INDEX "queue_tickets_event_id_status_created_at_idx" ON "queue_tickets"("event_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "queue_tickets_event_id_faculty_id_status_created_at_idx" ON "queue_tickets"("event_id", "faculty_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "queue_tickets_event_id_ticket_number_key" ON "queue_tickets"("event_id", "ticket_number");

-- CreateIndex
CREATE UNIQUE INDEX "queue_tickets_event_id_faculty_id_sequence_number_key" ON "queue_tickets"("event_id", "faculty_id", "sequence_number");

-- AddForeignKey
ALTER TABLE "event_faculties" ADD CONSTRAINT "event_faculties_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_faculties" ADD CONSTRAINT "event_faculties_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operators" ADD CONSTRAINT "operators_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_faculty_id_fkey" FOREIGN KEY ("faculty_id") REFERENCES "faculties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
