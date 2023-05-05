/*
  Warnings:

  - A unique constraint covering the columns `[candyMachineSlug]` on the table `CandyMachineDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CandyMachineDraft" ADD COLUMN     "candyMachineSlug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachineDraft_candyMachineSlug_key" ON "CandyMachineDraft"("candyMachineSlug");
