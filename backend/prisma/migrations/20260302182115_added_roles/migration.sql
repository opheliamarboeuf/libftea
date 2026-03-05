-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'MOD';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bannedAt" TIMESTAMP(3);
