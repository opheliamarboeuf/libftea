-- CreateEnum
CREATE TYPE "ModerationType" AS ENUM ('DELETE_ANY_POST', 'CHANGE_ROLE', 'BAN_USER', 'CREATE_TOURNAMENT', 'REVIEW_REPORT');

-- CreateTable
CREATE TABLE "ModerationLog" (
    "id" SERIAL NOT NULL,
    "action" "ModerationType" NOT NULL,
    "actorId" INTEGER NOT NULL,
    "targetUserId" INTEGER,
    "targetPostId" INTEGER,
    "targetBattleId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ModerationLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_targetPostId_fkey" FOREIGN KEY ("targetPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationLog" ADD CONSTRAINT "ModerationLog_targetBattleId_fkey" FOREIGN KEY ("targetBattleId") REFERENCES "Battle"("id") ON DELETE SET NULL ON UPDATE CASCADE;
