/*
  Warnings:

  - You are about to drop the column `url` on the `PinnedFiles` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "PinnedFiles_url_key";

-- AlterTable
ALTER TABLE "PinnedFiles" DROP COLUMN "url";
