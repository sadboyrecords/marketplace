-- AddForeignKey
ALTER TABLE "CandyMachineDraft" ADD CONSTRAINT "CandyMachineDraft_candyMachineId_fkey" FOREIGN KEY ("candyMachineId") REFERENCES "CandyMachines"("candyMachineId") ON DELETE SET NULL ON UPDATE CASCADE;
