-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('DRAFT', 'LAUNCHED', 'PENDING');

-- AlterTable
ALTER TABLE "CandyMachineDraft" ADD COLUMN     "status" "DraftStatus";
