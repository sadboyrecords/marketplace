-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "lastRefresh" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;