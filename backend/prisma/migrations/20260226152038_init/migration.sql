-- CreateEnum
CREATE TYPE "BattleStatus" AS ENUM ('UPCOMING', 'ACTIVE', 'FINISHED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_postId_fkey";

-- AlterTable
ALTER TABLE "Battle" ADD COLUMN     "createdById" INTEGER,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "maxPlayers" INTEGER,
ADD COLUMN     "rules" TEXT,
ADD COLUMN     "status" "BattleStatus" NOT NULL DEFAULT 'UPCOMING',
ADD COLUMN     "winnerId" INTEGER;

-- AlterTable
ALTER TABLE "BattleParticipant" ADD COLUMN     "submittedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "postId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "_BattleParticipantToVote" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_BattleParticipantToVote_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_BattleParticipantToVote_B_index" ON "_BattleParticipantToVote"("B");

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattleParticipantToVote" ADD CONSTRAINT "_BattleParticipantToVote_A_fkey" FOREIGN KEY ("A") REFERENCES "BattleParticipant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BattleParticipantToVote" ADD CONSTRAINT "_BattleParticipantToVote_B_fkey" FOREIGN KEY ("B") REFERENCES "Vote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
