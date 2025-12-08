-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('ADMIN', 'MANAGER', 'WORKER');

-- CreateEnum
CREATE TYPE "public"."ShiftType" AS ENUM ('DAY', 'NIGHT');

-- CreateEnum
CREATE TYPE "public"."WorkStatus" AS ENUM ('NORMAL', 'OVERTIME', 'EXTENDED');

-- CreateEnum
CREATE TYPE "public"."WorkerStatus" AS ENUM ('NORMAL', 'OVERTIME');

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "supabaseUserId" TEXT,
    "email" TEXT,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hireDate" TEXT,
    "role" "public"."Role" NOT NULL DEFAULT 'WORKER',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "licensePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deactivatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."work_classes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "work_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."factory_configs" (
    "id" TEXT NOT NULL DEFAULT 'global_config',
    "processCount" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "factory_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."factory_lines" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL,
    "workClassId" TEXT NOT NULL,

    CONSTRAINT "factory_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."line_shifts" (
    "id" TEXT NOT NULL,
    "type" "public"."ShiftType" NOT NULL,
    "status" "public"."WorkStatus" NOT NULL,
    "lineId" TEXT NOT NULL,

    CONSTRAINT "line_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."process_slots" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL DEFAULT 0,
    "shiftId" TEXT NOT NULL,
    "workerId" TEXT,
    "workerStatus" "public"."WorkStatus" NOT NULL DEFAULT 'NORMAL',

    CONSTRAINT "process_slots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_supabaseUserId_key" ON "public"."users"("supabaseUserId");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_userId_key" ON "public"."users"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "work_classes_name_key" ON "public"."work_classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "line_shifts_lineId_type_key" ON "public"."line_shifts"("lineId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "process_slots_shiftId_name_key" ON "public"."process_slots"("shiftId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "process_slots_shiftId_slotIndex_key" ON "public"."process_slots"("shiftId", "slotIndex");

-- AddForeignKey
ALTER TABLE "public"."factory_lines" ADD CONSTRAINT "factory_lines_workClassId_fkey" FOREIGN KEY ("workClassId") REFERENCES "public"."work_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."line_shifts" ADD CONSTRAINT "line_shifts_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "public"."factory_lines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_slots" ADD CONSTRAINT "process_slots_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "public"."line_shifts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."process_slots" ADD CONSTRAINT "process_slots_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
