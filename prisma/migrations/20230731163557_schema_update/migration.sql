/*
  Warnings:

  - A unique constraint covering the columns `[type,userId]` on the table `SocialAccount` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AdminValueType" AS ENUM ('LOOKUP');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apple" TEXT,
ADD COLUMN     "discord" TEXT,
ADD COLUMN     "facebook" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "reddit" TEXT,
ADD COLUMN     "soundcloud" TEXT,
ADD COLUMN     "spotify" TEXT,
ADD COLUMN     "telegram" TEXT,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "twitter" TEXT,
ADD COLUMN     "website" TEXT,
ADD COLUMN     "youtube" TEXT;

-- CreateTable
CREATE TABLE "AdminValues" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publicKey" TEXT,
    "ownerKey" TEXT,
    "uniqueType" "AdminValueType",

    CONSTRAINT "AdminValues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminValues_uniqueType_key" ON "AdminValues"("uniqueType");

-- CreateIndex
CREATE UNIQUE INDEX "SocialAccount_type_userId_key" ON "SocialAccount"("type", "userId");
