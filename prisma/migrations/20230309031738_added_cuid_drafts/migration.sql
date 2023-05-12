/*
  Warnings:

  - A unique constraint covering the columns `[draftId]` on the table `CandyMachineDraft` will be added. If there are existing duplicate values, this will fail.
  - The required column `draftId` was added to the `CandyMachineDraft` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "CandyMachineDraft" ADD COLUMN     "draftId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachineDraft_draftId_key" ON "CandyMachineDraft"("draftId");
