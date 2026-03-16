/*
  Warnings:

  - A unique constraint covering the columns `[userId,postId,battleId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Like_userId_postId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_battleId_key" ON "Like"("userId", "postId", "battleId");
