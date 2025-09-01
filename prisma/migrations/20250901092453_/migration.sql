/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `line_changes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `work_logs` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[loginId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `loginId` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."line_changes" DROP CONSTRAINT "line_changes_workLogId_fkey";

-- DropForeignKey
ALTER TABLE "public"."work_logs" DROP CONSTRAINT "work_logs_workerId_fkey";

-- DropIndex
DROP INDEX "public"."users_email_key";

-- AlterTable
ALTER TABLE "public"."users" DROP COLUMN "email",
ADD COLUMN     "adminMemo" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "licensePhoto" TEXT,
ADD COLUMN     "loginId" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."line_changes";

-- DropTable
DROP TABLE "public"."work_logs";

-- DropEnum
DROP TYPE "public"."WorkStatus";

-- CreateIndex
CREATE UNIQUE INDEX "users_loginId_key" ON "public"."users"("loginId");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "public"."users"("role");
