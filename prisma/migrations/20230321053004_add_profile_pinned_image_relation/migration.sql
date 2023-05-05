-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profilePictureHash_fkey" FOREIGN KEY ("profilePictureHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileBannerHash_fkey" FOREIGN KEY ("profileBannerHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE SET NULL ON UPDATE CASCADE;
