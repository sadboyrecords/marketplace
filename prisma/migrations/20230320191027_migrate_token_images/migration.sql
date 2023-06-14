-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT DISTINCT ON ("lossyArtworkIPFSHash") "lossyArtworkIPFSHash", "lossyArtworkURL", CONCAT('nft/images/', "lossyArtworkIPFSHash"), 'IMAGE' AS "type", 'PENDING' AS "status", "lossyArtworkIPFSHash", "updatedAt", "createdAt"
FROM "Tokens" 
WHERE "lossyArtworkIPFSHash" IS NOT NULL
  AND "lossyArtworkIPFSHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles")
ORDER BY "lossyArtworkIPFSHash", "id" ASC;
