-- CreateEnum
CREATE TYPE "AllowedTypes" AS ENUM ('CREATE_DROPS');

-- AlterTable
ALTER TABLE "CandyMachines" ADD COLUMN     "isPublic" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AllowedWallets" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "isAllowed" BOOLEAN NOT NULL DEFAULT false,
    "type" "AllowedTypes" NOT NULL,

    CONSTRAINT "AllowedWallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedWallets_walletAddress_key" ON "AllowedWallets"("walletAddress");
