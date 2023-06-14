/*
  Warnings:

  - The values [PHONE] on the enum `SocialType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SocialType_new" AS ENUM ('TWITTER', 'INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'SPOTIFY', 'APPLE', 'TIKTOK', 'SOUNDCLOUD', 'DISCORD', 'TELEGRAM', 'REDDIT', 'GITHUB', 'LINKEDIN', 'WEBSITE', 'EMAIL');
ALTER TABLE "SocialAccount" ALTER COLUMN "type" TYPE "SocialType_new" USING ("type"::text::"SocialType_new");
ALTER TYPE "SocialType" RENAME TO "SocialType_old";
ALTER TYPE "SocialType_new" RENAME TO "SocialType";
DROP TYPE "SocialType_old";
COMMIT;
