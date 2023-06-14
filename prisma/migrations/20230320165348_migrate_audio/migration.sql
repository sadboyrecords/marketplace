-- Insert into Pinned Files

INSERT INTO "PinnedFiles" ("ipfsHash", "originalUrl", "path", "type", "status", "id", "updatedAt", "createdAt")
SELECT "lossyAudioIPFSHash", "lossyAudioURL", CONCAT('nft/audio/', "lossyAudioIPFSHash"), 'AUDIO' AS "type", 'PENDING' AS "status", "lossyAudioIPFSHash", "updatedAt", "createdAt"
FROM "Songs" 
WHERE "lossyAudioIPFSHash" IS NOT NULL
  AND "lossyAudioIPFSHash" NOT IN (SELECT "ipfsHash" FROM "PinnedFiles");

