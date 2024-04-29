/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Songs` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug]` on the table `Tokens` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Leaks" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "leakName" TEXT NOT NULL,
    "priority" INTEGER DEFAULT 0,
    "imageIpfsHash" TEXT NOT NULL,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Leaks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeaksToSongs" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Leaks_slug_key" ON "Leaks"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "_LeaksToSongs_AB_unique" ON "_LeaksToSongs"("A", "B");

-- CreateIndex
CREATE INDEX "_LeaksToSongs_B_index" ON "_LeaksToSongs"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Songs_slug_key" ON "Songs"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Tokens_slug_key" ON "Tokens"("slug");

-- AddForeignKey
ALTER TABLE "Leaks" ADD CONSTRAINT "Leaks_imageIpfsHash_fkey" FOREIGN KEY ("imageIpfsHash") REFERENCES "PinnedFiles"("ipfsHash") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeaksToSongs" ADD CONSTRAINT "_LeaksToSongs_A_fkey" FOREIGN KEY ("A") REFERENCES "Leaks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeaksToSongs" ADD CONSTRAINT "_LeaksToSongs_B_fkey" FOREIGN KEY ("B") REFERENCES "Songs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
