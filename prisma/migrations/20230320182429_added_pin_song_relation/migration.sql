-- AddForeignKey
ALTER TABLE "Songs" ADD CONSTRAINT "Songs_lossyArtworkIPFSHash_fkey" FOREIGN KEY ("lossyArtworkIPFSHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Songs" ADD CONSTRAINT "Songs_lossyAudioIPFSHash_fkey" FOREIGN KEY ("lossyAudioIPFSHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;
