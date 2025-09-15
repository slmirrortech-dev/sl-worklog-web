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
CREATE TABLE "public"."Line" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "classNo" INTEGER[] DEFAULT ARRAY[1]::INTEGER[],

    CONSTRAINT "Line_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "public"."WorkLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "userUserId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userBirthday" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER NOT NULL,
    "processShiftId" TEXT,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkLogHistory" (
    "id" TEXT NOT NULL,
    "workLogId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "changedBy" TEXT NOT NULL,
    "changedByName" TEXT NOT NULL,
    "changedByUserId" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkLogHistory_pkey" PRIMARY KEY ("id")
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

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "public"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Line_name_key" ON "public"."Line"("name");

-- CreateIndex
CREATE UNIQUE INDEX "process_shifts_processId_type_key" ON "public"."process_shifts"("processId", "type");

-- CreateIndex
CREATE INDEX "WorkLog_userId_idx" ON "public"."WorkLog"("userId");

-- CreateIndex
CREATE INDEX "WorkLog_processShiftId_idx" ON "public"."WorkLog"("processShiftId");

-- CreateIndex
CREATE INDEX "WorkLog_startedAt_idx" ON "public"."WorkLog"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "edit_locks_resourceType_key" ON "public"."edit_locks"("resourceType");

-- AddForeignKey
ALTER TABLE "public"."processes" ADD CONSTRAINT "processes_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."Line"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_shifts" ADD CONSTRAINT "process_shifts_processId_fkey" FOREIGN KEY ("processId") REFERENCES "public"."processes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_shifts" ADD CONSTRAINT "process_shifts_waitingWorkerId_fkey" FOREIGN KEY ("waitingWorkerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLog" ADD CONSTRAINT "WorkLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLog" ADD CONSTRAINT "WorkLog_processShiftId_fkey" FOREIGN KEY ("processShiftId") REFERENCES "public"."process_shifts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLogHistory" ADD CONSTRAINT "WorkLogHistory_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "public"."WorkLog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkLogHistory" ADD CONSTRAINT "WorkLogHistory_changedBy_fkey" FOREIGN KEY ("changedBy") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."edit_locks" ADD CONSTRAINT "edit_locks_lockedBy_fkey" FOREIGN KEY ("lockedBy") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
