-- AlterTable
ALTER TABLE "Songs" ADD COLUMN     "isDuplicate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Tokens" ADD COLUMN     "oldSongId" TEXT;

-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_oldSongId_fkey" FOREIGN KEY ("oldSongId") REFERENCES "Songs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
