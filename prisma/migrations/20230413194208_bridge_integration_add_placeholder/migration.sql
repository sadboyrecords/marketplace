/*
  Warnings:

  - A unique constraint covering the columns `[candyMachineIdPlaceholder]` on the table `CandyMachineDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CandyMachineDraft" ADD COLUMN     "candyMachineIdPlaceholder" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachineDraft_candyMachineIdPlaceholder_key" ON "CandyMachineDraft"("candyMachineIdPlaceholder");
