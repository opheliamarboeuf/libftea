-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "bannedDeletion" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "bannedDeletion" BOOLEAN NOT NULL DEFAULT false;
