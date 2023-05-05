-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_lossyArtworkIPFSHash_fkey" FOREIGN KEY ("lossyArtworkIPFSHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_audioIpfsHash_fkey" FOREIGN KEY ("audioIpfsHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;
