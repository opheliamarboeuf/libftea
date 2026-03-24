-- CreateTable
CREATE TABLE "PostHiddenForUser" (
    "id" SERIAL NOT NULL,
    "postId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "PostHiddenForUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PostHiddenForUser_postId_userId_key" ON "PostHiddenForUser"("postId", "userId");

-- AddForeignKey
ALTER TABLE "PostHiddenForUser" ADD CONSTRAINT "PostHiddenForUser_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostHiddenForUser" ADD CONSTRAINT "PostHiddenForUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
