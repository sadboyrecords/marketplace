-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT DISTINCT ON ("profilePictureHash") "profilePictureHash", "profilePictureImage", CONCAT('nft/images/', "profilePictureHash"), 'IMAGE' AS "type", 'PENDING' AS "status", "profilePictureHash", "updatedAt", "createdAt"
FROM "User" 
WHERE "profilePictureHash" IS NOT NULL
  AND "profilePictureHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles")
ORDER BY "profilePictureHash", "id" ASC;
