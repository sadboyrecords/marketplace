-- CreateEnum
CREATE TYPE "SocialType" AS ENUM ('TWITTER', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'SPOTIFY', 'APPLE', 'TIKTOK', 'SOUNDCLOUD', 'DISCORD', 'TELEGRAM', 'REDDIT', 'GITHUB', 'LINKEDIN', 'WEBSITE', 'EMAIL', 'PHONE');

-- CreateEnum
CREATE TYPE "PlaylistType" AS ENUM ('LIKED', 'CREATED');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('LISTED', 'SOLD', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('AUCTION', 'FIXED');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('SOL', 'USD');

-- CreateEnum
CREATE TYPE "Chains" AS ENUM ('solana');

-- CreateTable
CREATE TABLE "knex_migrations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255),
    "batch" INTEGER,
    "migration_time" TIMESTAMPTZ(6),

    CONSTRAINT "knex_migrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedUsers" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "likedAddressId" TEXT NOT NULL,
    "likedByAddress" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,

    CONSTRAINT "LikedUsers_pkey" PRIMARY KEY ("likedAddressId","likedByAddress")
);

-- CreateTable
CREATE TABLE "Follow" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "followerAddress" TEXT NOT NULL,
    "followingAddress" TEXT NOT NULL,
    "isFollowing" BOOLEAN NOT NULL,

    CONSTRAINT "Follow_pkey" PRIMARY KEY ("followingAddress","followerAddress")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    "profileBannerImage" TEXT,
    "profilePictureImage" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Playlists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "playlistImageUrl" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "walletAddress" TEXT NOT NULL,

    CONSTRAINT "Playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedPlaylists" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "likedById" TEXT NOT NULL,

    CONSTRAINT "LikedPlaylists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialAccount" (
    "id" SERIAL NOT NULL,
    "type" "SocialType" NOT NULL,
    "url" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "verified" TIMESTAMP(3),

    CONSTRAINT "SocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedDrops" (
    "id" TEXT NOT NULL,
    "candyMachineId" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,
    "likedByWallet" TEXT NOT NULL,

    CONSTRAINT "LikedDrops_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CandyMachines" (
    "id" TEXT NOT NULL,
    "candyMachineId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "earlyAccessStartDate" TIMESTAMP(3),
    "earlyAccessEndDate" TIMESTAMP(3),
    "whiteListStartDate" TIMESTAMP(3),
    "whiteListEndDate" TIMESTAMP(3),
    "preSaleStartDate" TIMESTAMP(3),
    "preSaleEndDate" TIMESTAMP(3),
    "ownerWalletAddress" TEXT NOT NULL,
    "songId" TEXT,
    "audioUri" TEXT NOT NULL,
    "audioIpfsHash" TEXT NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "imageIpfsHash" TEXT NOT NULL,
    "candyMachineImageUrl" TEXT NOT NULL,
    "jsonIpfsHash" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "dropName" TEXT NOT NULL,
    "collectionAddress" TEXT,

    CONSTRAINT "CandyMachines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LikedTracks" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "userWallet" TEXT NOT NULL,
    "isLiked" BOOLEAN NOT NULL,

    CONSTRAINT "LikedTracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Songs" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "slug" VARCHAR(1020) NOT NULL,
    "lossyAudioIPFSHash" TEXT,
    "lossyAudioURL" TEXT NOT NULL,
    "lossyArtworkIPFSHash" VARCHAR(255),
    "lossyArtworkURL" TEXT,
    "platformInternalId" TEXT,
    "description" TEXT,
    "websiteUrl" TEXT,
    "platformId" TEXT,
    "artistNames" TEXT[],
    "otherTrackTitles" TEXT[],

    CONSTRAINT "Songs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tokens" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "mintAddress" TEXT NOT NULL,
    "chain" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "songId" TEXT NOT NULL,
    "collectionAddress" TEXT,
    "tokenUri" TEXT NOT NULL,
    "audioUri" TEXT NOT NULL,
    "audioIpfsHash" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" VARCHAR(1020) NOT NULL,
    "lossyArtworkIPFSHash" VARCHAR(255),
    "lossyArtworkURL" TEXT,
    "platformInternalId" TEXT,
    "externalUrl" TEXT,
    "websiteUrl" TEXT,
    "platformId" TEXT,

    CONSTRAINT "Tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collections" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Collections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tokenMintAddress" TEXT NOT NULL,
    "sellerWalletAddress" TEXT NOT NULL,
    "receiptAddress" TEXT NOT NULL,
    "freeSellerTradeState" TEXT,
    "status" "ListingStatus" NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "songUrl" TEXT NOT NULL,
    "metadataUrl" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "auctionHouseAddress" TEXT NOT NULL,
    "listingType" "ListingType" NOT NULL,
    "currency" "CurrencyType" NOT NULL DEFAULT 'SOL',

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IndexingError" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "error" TEXT,
    "rectified" BOOLEAN NOT NULL DEFAULT false,
    "originalData" JSONB,

    CONSTRAINT "IndexingError_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlaylistsToSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_CandyMachinesToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_SongsToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TokensToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LikedUsers_likedAddressId_likedByAddress_key" ON "LikedUsers"("likedAddressId", "likedByAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Follow_followingAddress_followerAddress_key" ON "Follow"("followingAddress", "followerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "Playlists_id_walletAddress_key" ON "Playlists"("id", "walletAddress");

-- CreateIndex
CREATE UNIQUE INDEX "LikedPlaylists_playlistId_likedById_key" ON "LikedPlaylists"("playlistId", "likedById");

-- CreateIndex
CREATE UNIQUE INDEX "LikedDrops_candyMachineId_likedByWallet_key" ON "LikedDrops"("candyMachineId", "likedByWallet");

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachines_candyMachineId_key" ON "CandyMachines"("candyMachineId");

-- CreateIndex
CREATE UNIQUE INDEX "CandyMachines_slug_key" ON "CandyMachines"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LikedTracks_trackId_userWallet_key" ON "LikedTracks"("trackId", "userWallet");

-- CreateIndex
CREATE UNIQUE INDEX "Songs_lossyAudioIPFSHash_key" ON "Songs"("lossyAudioIPFSHash");

-- CreateIndex
CREATE UNIQUE INDEX "Songs_lossyAudioURL_key" ON "Songs"("lossyAudioURL");

-- CreateIndex
CREATE INDEX "Songs_lossyAudioIPFSHash_idx" ON "Songs"("lossyAudioIPFSHash");

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_mintAddress_chain_key" ON "Tokens"("mintAddress", "chain");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_receiptAddress_key" ON "Listing"("receiptAddress");

-- CreateIndex
CREATE UNIQUE INDEX "_PlaylistsToSongs_AB_unique" ON "_PlaylistsToSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_PlaylistsToSongs_B_index" ON "_PlaylistsToSongs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_CandyMachinesToUser_AB_unique" ON "_CandyMachinesToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_CandyMachinesToUser_B_index" ON "_CandyMachinesToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_SongsToUser_AB_unique" ON "_SongsToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_SongsToUser_B_index" ON "_SongsToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TokensToUser_AB_unique" ON "_TokensToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TokensToUser_B_index" ON "_TokensToUser"("B");

-- AddForeignKey
ALTER TABLE "LikedUsers" ADD CONSTRAINT "liked_by_user_fk" FOREIGN KEY ("likedByAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedUsers" ADD CONSTRAINT "liked_user_fk" FOREIGN KEY ("likedAddressId") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "user_im_following_fk" FOREIGN KEY ("followerAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follow" ADD CONSTRAINT "user_my_followers_fk" FOREIGN KEY ("followingAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Playlists" ADD CONSTRAINT "Playlists_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedPlaylists" ADD CONSTRAINT "LikedPlaylists_likedById_fkey" FOREIGN KEY ("likedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedPlaylists" ADD CONSTRAINT "LikedPlaylists_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlists"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedDrops" ADD CONSTRAINT "LikedDrops_likedByWallet_fkey" FOREIGN KEY ("likedByWallet") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedDrops" ADD CONSTRAINT "LikedDrops_candyMachineId_fkey" FOREIGN KEY ("candyMachineId") REFERENCES "CandyMachines"("candyMachineId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandyMachines" ADD CONSTRAINT "CandyMachines_ownerWalletAddress_fkey" FOREIGN KEY ("ownerWalletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandyMachines" ADD CONSTRAINT "CandyMachines_audioIpfsHash_fkey" FOREIGN KEY ("audioIpfsHash") REFERENCES "Songs"("lossyAudioIPFSHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CandyMachines" ADD CONSTRAINT "CandyMachines_collectionAddress_fkey" FOREIGN KEY ("collectionAddress") REFERENCES "Tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedTracks" ADD CONSTRAINT "LikedTracks_userWallet_fkey" FOREIGN KEY ("userWallet") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedTracks" ADD CONSTRAINT "LikedTracks_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "Songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Songs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistsToSongs" ADD CONSTRAINT "_PlaylistsToSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlaylistsToSongs" ADD CONSTRAINT "_PlaylistsToSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "Songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandyMachinesToUser" ADD CONSTRAINT "_CandyMachinesToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "CandyMachines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CandyMachinesToUser" ADD CONSTRAINT "_CandyMachinesToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SongsToUser" ADD CONSTRAINT "_SongsToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SongsToUser" ADD CONSTRAINT "_SongsToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TokensToUser" ADD CONSTRAINT "_TokensToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Tokens"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TokensToUser" ADD CONSTRAINT "_TokensToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
