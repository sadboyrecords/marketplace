/*
  Warnings:

  - You are about to drop the column `draftId` on the `CandyMachineDraft` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "CandyMachineDraft_draftId_key";

-- AlterTable
ALTER TABLE "CandyMachineDraft" DROP COLUMN "draftId";
