/*
  Warnings:

  - The `workerStatus` column on the `process_slots` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."process_slots" DROP COLUMN "workerStatus",
ADD COLUMN     "workerStatus" "public"."WorkerStatus";

-- CreateTable
CREATE TABLE "public"."training_logs" (
    "id" TEXT NOT NULL,
    "trainedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "training_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."defect_logs" (
    "id" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workerId" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "shiftType" "public"."ShiftType" NOT NULL,
    "processName" TEXT NOT NULL,
    "memo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "defect_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."workplace_snapshots" (
    "id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT,
    "createdByUserName" TEXT,
    "createdByUserUserId" TEXT,

    CONSTRAINT "workplace_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backup_schedules" (
    "id" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "backup_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "backup_schedules_time_key" ON "public"."backup_schedules"("time");

-- AddForeignKey
ALTER TABLE "public"."training_logs" ADD CONSTRAINT "training_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."defect_logs" ADD CONSTRAINT "defect_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."workplace_snapshots" ADD CONSTRAINT "workplace_snapshots_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
