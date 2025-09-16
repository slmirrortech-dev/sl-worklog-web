/*
  Warnings:

  - You are about to drop the `Line` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WorkLogHistory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."WorkLog" DROP CONSTRAINT "WorkLog_processShiftId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkLog" DROP CONSTRAINT "WorkLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkLogHistory" DROP CONSTRAINT "WorkLogHistory_changedBy_fkey";

-- DropForeignKey
ALTER TABLE "public"."WorkLogHistory" DROP CONSTRAINT "WorkLogHistory_workLogId_fkey";

-- DropForeignKey
ALTER TABLE "public"."processes" DROP CONSTRAINT "processes_lineId_fkey";

-- DropTable
DROP TABLE "public"."Line";

-- DropTable
DROP TABLE "public"."WorkLog";

-- DropTable
DROP TABLE "public"."WorkLogHistory";

-- CreateTable
CREATE TABLE "public"."lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "classNo" INTEGER[] DEFAULT ARRAY[1]::INTEGER[],

    CONSTRAINT "lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userUserId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userBirthday" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "processShiftId" TEXT,

    CONSTRAINT "work_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_log_history" (
    "id" TEXT NOT NULL,
    "workLogId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedByName" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "work_log_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cell_locks" (
    "id" TEXT NOT NULL,
    "cellId" TEXT NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "lockedByName" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cell_locks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lines_name_key" ON "public"."lines"("name");

-- CreateIndex
CREATE INDEX "work_log_userId_idx" ON "public"."work_log"("userId");

-- CreateIndex
CREATE INDEX "work_log_processShiftId_idx" ON "public"."work_log"("processShiftId");

-- CreateIndex
CREATE INDEX "work_log_startedAt_idx" ON "public"."work_log"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "cell_locks_cellId_key" ON "public"."cell_locks"("cellId");

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log" ADD CONSTRAINT "work_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log" ADD CONSTRAINT "work_log_processShiftId_fkey" FOREIGN KEY ("processShiftId") REFERENCES "public"."process_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log_history" ADD CONSTRAINT "work_log_history_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "public"."work_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log_history" ADD CONSTRAINT "work_log_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cell_locks" ADD CONSTRAINT "cell_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
