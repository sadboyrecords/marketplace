-- DropForeignKey
ALTER TABLE "CandyMachines" DROP CONSTRAINT "CandyMachines_collectionAddress_fkey";

-- AddForeignKey
ALTER TABLE "CandyMachines" ADD CONSTRAINT "CandyMachines_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "Tokens"("mintAddress") ON DELETE SET NULL ON UPDATE CASCADE;
