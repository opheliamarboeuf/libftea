/*
  Warnings:

  - A unique constraint covering the columns `[reporterId,reportedUserId]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Report_reporterId_reportedUserId_key" ON "Report"("reporterId", "reportedUserId");
