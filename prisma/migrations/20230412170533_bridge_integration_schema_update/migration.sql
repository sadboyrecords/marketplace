/*
  Warnings:

  - A unique constraint covering the columns `[externalID,partnerCode]` on the table `CandyMachineDraft` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PartnerCode" AS ENUM ('BRIDG3');

-- AlterTable
ALTER TABLE "CandyMachineDraft" ADD COLUMN     "artists" TEXT[],
ADD COLUMN     "creators" TEXT[],
ADD COLUMN     "externalID" TEXT,
ADD COLUMN     "featuredArtists" TEXT[],
ADD COLUMN     "isrc" TEXT,
ADD COLUMN     "partnerCode" "PartnerCode",
ADD COLUMN     "primaryArtists" TEXT[],
ADD COLUMN     "treasury" TEXT,
ADD COLUMN     "upc" TEXT;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" "PartnerCode" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_code_key" ON "Partner"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachineDraft_externalID_partnerCode_key" ON "CandyMachineDraft"("externalID", "partnerCode");

-- AddForeignKey
ALTER TABLE "CandyMachineDraft" ADD CONSTRAINT "CandyMachineDraft_partnerCode_fkey" FOREIGN KEY ("partnerCode") REFERENCES "Partner"("code") ON DELETE SET NULL ON UPDATE CASCADE;
