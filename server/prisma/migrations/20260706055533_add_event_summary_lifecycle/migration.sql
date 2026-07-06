-- AlterTable
ALTER TABLE "events" ADD COLUMN     "detail_deleted_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_end_at" TIMESTAMP(3),
ADD COLUMN     "summary_generated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "event_summaries" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_summaries_event_id_key" ON "event_summaries"("event_id");

-- CreateIndex
CREATE INDEX "events_scheduled_end_at_idx" ON "events"("scheduled_end_at");

-- AddForeignKey
ALTER TABLE "event_summaries" ADD CONSTRAINT "event_summaries_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;
