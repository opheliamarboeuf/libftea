/*
  Warnings:

  - You are about to drop the column `handled` on the `Report` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'RESOLVED', 'REJECTED');

-- AlterTable
ALTER TABLE "Report" DROP COLUMN "handled",
ADD COLUMN     "handledAt" TIMESTAMP(3),
ADD COLUMN     "status" "ReportStatus" NOT NULL DEFAULT 'PENDING';
