/*
  Warnings:

  - Added the required column `status` to the `PinnedFiles` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PinnedFilesStatus" AS ENUM ('PINNED', 'IN_PROGRESS', 'PENDING');

-- AlterTable
ALTER TABLE "PinnedFiles" ADD COLUMN     "status" "PinnedFilesStatus" NOT NULL;
