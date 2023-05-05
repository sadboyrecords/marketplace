import { NextApiRequest, NextApiResponse } from 'next';
import sha256 from 'crypto-js/sha256';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { PublicKey } from '@solana/web3.js';
import { prisma } from 'server/db/client';

const sign = async ({
  // user,
  publicKey,
  signature,
  message,
  // createUser,
}: {
  // user: any;
  publicKey: string;
  signature: string;
  message: string;
  // createUser?: boolean;
}) => {
  const pubKey = new PublicKey(publicKey);
  if (!pubKey) {
    throw new Error('No public key provided');
  }
  const messageBytes = stringToArray(message);

  const valid = nacl.sign.detached.verify(
    messageBytes,
    bs58.decode(signature),
    pubKey.toBytes()
  );

  return { publicKey, success: valid };
};

function stringToArray(bufferString: string) {
  const uint8Array = new TextEncoder().encode(bufferString);
  return uint8Array;
}
function arrayToString(bufferValue: Uint8Array) {
  return new TextDecoder('utf-8').decode(bufferValue);
}

export { sign, stringToArray, arrayToString };
export default sign;
