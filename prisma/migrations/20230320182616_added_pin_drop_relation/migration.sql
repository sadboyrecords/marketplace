-- AddForeignKey
ALTER TABLE "CandyMachines" ADD CONSTRAINT "CandyMachines_imageIpfsHash_fkey" FOREIGN KEY ("imageIpfsHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE RESTRICT ON UPDATE CASCADE;
