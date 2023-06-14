/*
  Warnings:

  - A unique constraint covering the columns `[magicSolanaAddress]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TransactionTypes" AS ENUM ('MINT', 'TRANSFER', 'LIST', 'BUY', 'CANDY_MACHINE');

-- CreateTable
CREATE TABLE "Transactions" (
    "id" TEXT NOT NULL,
    "signature" TEXT NOT NULL,
    "fromWalletAddress" TEXT,
    "receiverWalletAddress" TEXT,
    "candymachineAddress" TEXT,
    "tokenAddress" TEXT,
    "tokenAddressReferenceOnly" TEXT,
    "transactionType" "TransactionTypes" NOT NULL,
    "blockTime" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactions_signature_key" ON "Transactions"("signature");

-- CreateIndex
CREATE UNIQUE INDEX "User_magicSolanaAddress_key" ON "User"("magicSolanaAddress");

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_candymachineAddress_fkey" FOREIGN KEY ("candymachineAddress") REFERENCES "CandyMachines"("candyMachineId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_fromWalletAddress_fkey" FOREIGN KEY ("fromWalletAddress") REFERENCES "User"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_receiverWalletAddress_fkey" FOREIGN KEY ("receiverWalletAddress") REFERENCES "User"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transactions" ADD CONSTRAINT "Transactions_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Tokens"("mintAddress") ON DELETE SET NULL ON UPDATE CASCADE;
