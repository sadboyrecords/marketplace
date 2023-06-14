-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT DISTINCT ON ("audioIpfsHash") "audioIpfsHash", "audioUri", CONCAT('nft/audio/', "audioIpfsHash"), 'AUDIO' AS "type", 'PENDING' AS "status", "audioIpfsHash", "updatedAt", "createdAt"
FROM "Tokens" 
WHERE "audioIpfsHash" IS NOT NULL
  AND "audioIpfsHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles")
ORDER BY "audioIpfsHash", "id" ASC;

