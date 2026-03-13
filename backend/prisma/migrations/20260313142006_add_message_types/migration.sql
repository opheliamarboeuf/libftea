-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'BATTLE_INVITE', 'BATTLE_NOTIFICATION');

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "battleId" INTEGER,
ADD COLUMN     "type" "MessageType" NOT NULL DEFAULT 'TEXT';
