/*
  Warnings:

  - You are about to drop the `Vote` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_BattleParticipantToVote` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_battleId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_postId_fkey";

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voterId_fkey";

-- DropForeignKey
ALTER TABLE "_BattleParticipantToVote" DROP CONSTRAINT "_BattleParticipantToVote_A_fkey";

-- DropForeignKey
ALTER TABLE "_BattleParticipantToVote" DROP CONSTRAINT "_BattleParticipantToVote_B_fkey";

-- AlterTable
ALTER TABLE "Like" ADD COLUMN     "battleId" INTEGER,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "Vote";

-- DropTable
DROP TABLE "_BattleParticipantToVote";

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
