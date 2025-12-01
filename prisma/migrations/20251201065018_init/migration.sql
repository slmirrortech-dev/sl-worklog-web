-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MANAGER', 'WORKER');

-- CreateEnum
CREATE TYPE "public"."ShiftType" AS ENUM ('DAY', 'NIGHT');

-- CreateEnum
CREATE TYPE "public"."WorkStatus" AS ENUM ('NORMAL', 'OVERTIME', 'EXTENDED');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "birthday" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'WORKER',
    "isInitialPasswordChanged" BOOLEAN NOT NULL DEFAULT false,
    "licensePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "classNo" TEXT NOT NULL DEFAULT '1',

    CONSTRAINT "lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."processes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "lineId" TEXT NOT NULL,

    CONSTRAINT "processes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."process_shifts" (
    "id" TEXT NOT NULL,
    "type" "public"."ShiftType" NOT NULL,
    "status" "public"."WorkStatus" NOT NULL DEFAULT 'NORMAL',
    "processId" TEXT NOT NULL,
    "waitingWorkerId" TEXT,

    CONSTRAINT "process_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_log" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userUserId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "isDefective" BOOLEAN NOT NULL DEFAULT false,
    "processShiftId" TEXT,
    "processName" TEXT NOT NULL,
    "lineName" TEXT NOT NULL,
    "lineClassNo" TEXT NOT NULL,
    "shiftType" "public"."ShiftType" NOT NULL,
    "workStatus" "public"."WorkStatus" NOT NULL,
    "memo" TEXT,

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
CREATE TABLE "public"."edit_locks" (
    "id" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "lockedBy" TEXT NOT NULL,
    "lockedByName" TEXT NOT NULL,
    "lockedByUserId" TEXT NOT NULL,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "heartbeatAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edit_locks_pkey" PRIMARY KEY ("id")
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
CREATE UNIQUE INDEX "users_userId_key" ON "public"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "lines_name_classNo_key" ON "public"."lines"("name", "classNo");

-- CreateIndex
CREATE UNIQUE INDEX "process_shifts_processId_type_key" ON "public"."process_shifts"("processId", "type");

-- CreateIndex
CREATE INDEX "work_log_userId_idx" ON "public"."work_log"("userId");

-- CreateIndex
CREATE INDEX "work_log_startedAt_idx" ON "public"."work_log"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "edit_locks_resourceType_key" ON "public"."edit_locks"("resourceType");

-- CreateIndex
CREATE UNIQUE INDEX "cell_locks_cellId_key" ON "public"."cell_locks"("cellId");

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."lines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_shifts" ADD CONSTRAINT "process_shifts_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_shifts" ADD CONSTRAINT "process_shifts_waitingWorkerId_fkey" FOREIGN KEY ("waitingWorkerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log" ADD CONSTRAINT "work_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log_history" ADD CONSTRAINT "work_log_history_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "public"."work_log"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."work_log_history" ADD CONSTRAINT "work_log_history_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."edit_locks" ADD CONSTRAINT "edit_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cell_locks" ADD CONSTRAINT "cell_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
