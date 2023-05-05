/*
  Warnings:

  - A unique constraint covering the columns `[mintAddress]` on the table `Tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CandyMachines" ALTER COLUMN "isPublic" SET DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_mintAddress_key" ON "Tokens"("mintAddress");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_tokenMintAddress_fkey" FOREIGN KEY ("tokenMintAddress") REFERENCES "Tokens"("mintAddress") ON DELETE RESTRICT ON UPDATE CASCADE;
