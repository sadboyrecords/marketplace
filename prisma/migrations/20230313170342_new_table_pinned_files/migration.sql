-- CreateEnum
CREATE TYPE "PinnedFileType" AS ENUM ('AUDIO', 'IMAGE', 'VIDEO');

-- CreateTable
CREATE TABLE "PinnedFiles" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ipfsHash" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "type" "PinnedFileType" NOT NULL,
    "orginalUrl" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "name" TEXT,
    "blurUrl" TEXT,
    "pinnedToFileBase" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PinnedFiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PinnedFiles_ipfsHash_key" ON "PinnedFiles"("ipfsHash");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedFiles_url_key" ON "PinnedFiles"("url");

-- CreateIndex
CREATE UNIQUE INDEX "PinnedFiles_path_key" ON "PinnedFiles"("path");
