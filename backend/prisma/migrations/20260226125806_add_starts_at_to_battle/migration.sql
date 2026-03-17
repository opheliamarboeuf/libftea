/*
  Warnings:

  - Added the required column `startsAt` to the `Battle` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "startsAt" TIMESTAMP(3) NOT NULL;
