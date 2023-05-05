-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT DISTINCT ON ("imageIpfsHash") "imageIpfsHash", "candyMachineImageUrl", CONCAT('nft/images/', "imageIpfsHash"), 'IMAGE' AS "type", 'PENDING' AS "status", "imageIpfsHash", "updatedAt", "createdAt"
FROM "CandyMachines" 
WHERE "imageIpfsHash" IS NOT NULL
  AND "imageIpfsHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles")
ORDER BY "imageIpfsHash", "id" ASC;

