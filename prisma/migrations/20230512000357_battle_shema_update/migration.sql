-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT;

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Battle" (
    "id" TEXT NOT NULL,
    "isLive" BOOLEAN NOT NULL DEFAULT false,
    "isReady" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "displayOnHomePage" BOOLEAN NOT NULL DEFAULT false,
    "order" SERIAL NOT NULL,
    "createdByNifty" BOOLEAN NOT NULL DEFAULT false,
    "battleName" TEXT NOT NULL,
    "battleDescription" TEXT,
    "battlePrice" DOUBLE PRECISION,
    "battleStartDate" TIMESTAMP(3) NOT NULL,
    "battleEndDate" TIMESTAMP(3) NOT NULL,
    "royalties" DOUBLE PRECISION,
    "itemsAvailable" INTEGER,
    "slug" TEXT,
    "createdByWallet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Battle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BattleContestants" (
    "id" TEXT NOT NULL,
    "primaryArtistName" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "candyMachineId" TEXT,
    "battleId" TEXT NOT NULL,

    CONSTRAINT "BattleContestants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Battle_slug_key" ON "Battle"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BattleContestants_draftId_key" ON "BattleContestants"("draftId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleContestants_candyMachineId_key" ON "BattleContestants"("candyMachineId");

-- CreateIndex
CREATE UNIQUE INDEX "BattleContestants_battleId_walletAddress_key" ON "BattleContestants"("battleId", "walletAddress");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Battle" ADD CONSTRAINT "Battle_createdByWallet_fkey" FOREIGN KEY ("createdByWallet") REFERENCES "User"("walletAddress") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleContestants" ADD CONSTRAINT "BattleContestants_walletAddress_fkey" FOREIGN KEY ("walletAddress") REFERENCES "User"("walletAddress") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleContestants" ADD CONSTRAINT "BattleContestants_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "CandyMachineDraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleContestants" ADD CONSTRAINT "BattleContestants_candyMachineId_fkey" FOREIGN KEY ("candyMachineId") REFERENCES "CandyMachines"("candyMachineId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BattleContestants" ADD CONSTRAINT "BattleContestants_battleId_fkey" FOREIGN KEY ("battleId") REFERENCES "Battle"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
