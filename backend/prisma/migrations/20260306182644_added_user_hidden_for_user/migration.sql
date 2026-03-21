-- CreateTable
CREATE TABLE "UserHiddenForUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "targetUserId" INTEGER NOT NULL,

    CONSTRAINT "UserHiddenForUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserHiddenForUser_targetUserId_userId_key" ON "UserHiddenForUser"("targetUserId", "userId");

-- AddForeignKey
ALTER TABLE "UserHiddenForUser" ADD CONSTRAINT "UserHiddenForUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHiddenForUser" ADD CONSTRAINT "UserHiddenForUser_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
