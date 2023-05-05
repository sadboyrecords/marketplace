-- CreateEnum
CREATE TYPE "CandyMachineSteps" AS ENUM ('CREATED', 'METADATA_UPLOAD', 'CREATE_COLLECTION', 'CREATE_CANDY_MACHINE', 'INSERT_ITEMS', 'UPDATE_DB');

-- CreateTable
CREATE TABLE "CandyMachineDraft" (
    "id" TEXT NOT NULL,
    "candyMachineId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "formSubmission" JSONB NOT NULL,
    "metaDataHash" DOUBLE PRECISION[],
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "earlyAccessStartDate" TIMESTAMP(3),
    "earlyAccessEndDate" TIMESTAMP(3),
    "whiteListStartDate" TIMESTAMP(3),
    "whiteListEndDate" TIMESTAMP(3),
    "preSaleStartDate" TIMESTAMP(3),
    "preSaleEndDate" TIMESTAMP(3),
    "ownerWalletAddress" TEXT NOT NULL,
    "songId" TEXT,
    "audioUri" TEXT,
    "audioIpfsHash" TEXT,
    "imageIpfsHash" TEXT,
    "candyMachineImageUrl" TEXT,
    "jsonIpfsHash" TEXT,
    "description" TEXT,
    "dropName" TEXT,
    "collectionAddress" TEXT,
    "lowestPrice" DOUBLE PRECISION,
    "items" INTEGER,
    "currentStep" "CandyMachineSteps" NOT NULL,

    CONSTRAINT "CandyMachineDraft_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachineDraft_candyMachineId_key" ON "CandyMachineDraft"("candyMachineId");
