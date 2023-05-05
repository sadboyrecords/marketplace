-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT DISTINCT ON ("profileBannerHash") "profileBannerHash", "profileBannerImage", CONCAT('nft/images/', "profileBannerHash"), 'IMAGE' AS "type", 'PENDING' AS "status", "profileBannerHash", "updatedAt", "createdAt"
FROM "User" 
WHERE "profileBannerHash" IS NOT NULL
  AND "profileBannerHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles")
ORDER BY "profileBannerHash", "id" ASC;
