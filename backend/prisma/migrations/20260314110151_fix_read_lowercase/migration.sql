/*
  Warnings:

  - You are about to drop the column `Read` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "Read",
ADD COLUMN     "read" BOOLEAN NOT NULL DEFAULT false;
