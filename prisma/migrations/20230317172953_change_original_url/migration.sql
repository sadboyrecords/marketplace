/*
  Warnings:

  - You are about to drop the column `orginalUrl` on the `PinnedFiles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PinnedFiles" DROP COLUMN "orginalUrl",
ADD COLUMN     "originalUrl" TEXT;
