export const env = process.env.NEXT_PUBLIC_ENV as "prod" | "dev";

export const coinflowFeePayer =
  env === "prod"
    ? "9hbnec2G7tEq76jbitZ7ykVPzz5QnB3Rjc9zcKjPCsae"
    : "75N3e5H9o8VswtNcAnWr9gHN1HCE1yAWdiaEHEesXssd";

export const socialMediaPrefix = {
  twitter: "https://twitter.com/",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
  discord: "https://discord.gg/", //https://discordapp.com/users https://discord.com/invite/myWKuNQF7V
  tiktok: "https://www.tiktok.com/@",
  youtube: "https://www.youtube.com/",
  spotify: "https://open.spotify.com/artist/",
  // telegram: "https://t.me/niftytunesnft",
  // medium: "https://niftytunesnft.medium.com/",
  // github: "",
};

export const solanaUsdToken =
  env === "prod"
    ? "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    : "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export const battleDropsTreasury = process.env.NEXT_PUBLIC_BATTLE_TREASURY;
// export const splTokenAccount = process.env.NEXT_PUBLIC_SPL_TOKEN_ACCOUNT; //Simalar to treasury, this is the address that will receive the USDC

export const imageDomains = [
  "placekitten.com",
  "spinamp.mypinata.cloud",
  "www.arweave.net",
  "arweave.net",
  "reamp.mypinata.cloud",
  "gateway.pinata.cloud",
  "ipfs.io",
  "niftytunes.b-cdn.net",
  "niftytunes.myfilebase.com",
];

export const globalMeta = {
  siteName: "NiftyTunes",
  siteUrl: "https://www.niftytunes.xyz/",
  siteLogo: "/logo/icon_192.png",
  // email: "email@yoursite.com",
  description: "Your one stop shop for Music Collectables.",
};

export const routes = {
  home: "/",
  userProfile: (slug: string) => `/user/${slug}`,
  userTokens: (slug: string) => `/user/${slug}/owned`,
  userDrafts: (slug: string) => `/user/${slug}/drafts`,
  artistProfile: (slug: string) => `/user/${slug}`,
  playlists: "/playlist",
  artists: "/creators",
  upcomingDrops: "/upcoming-drops",
  editBattle: (id: string) => `/admin/battles/edit/${id}`,
  collectionDetails: (tokenAddress: string) => `/tokens/${tokenAddress}`,
  tokenItemDetails: (mintAddress: string) => `/nft-details/${mintAddress}`,
  collections: "/collections",
  songs: "/songs",
  playlistDetail: (playlistId: string) => `/playlist/${playlistId}`,
  tokenSale: (mintAddress: string) => `/list/${mintAddress}`,
  dropDetails: (slug: string) => `/drop/${slug}`,
  newDrop: "/new-drop",
  drops: "/drops",
  listings: "/listings",
  drafts: (id: string) => `/drafts/${id}`,
  battleDropDrafts: (id: string) => `/admin/battles/drop/draft/${id}`,
  battleDrop: (id: string) => `/admin/battles/drop/detail/${id}`,
  admin: "/admin",
  allBattles: "/battles",
  battleDetails: (id: string) => `/admin/battles/detail/${id}`,
  allPublicBattles: "/battles",
  allBattlesAdminView: "/admin/battles",
  battleDetailsAdminView: (id: string) => `/admin/battles/${id}`,
  createBattle: "/admin/new-battle",
  lookupTable: "/admin/lookup",
  leaks: "/admin/leaks",
  createLeak: "/admin/leaks/new-leak",
  leakDetails: (slug: string) => `/admin/leaks/detail/${slug}`,
  editLeak: (slug: string) => `/admin/leaks/edit/${slug}`,
  battleDropsHome: "/battle-drops",
  soloDropsHome: "/solo-drops",
};

export const tabMenuRoutes = {
  userProfileTabPages: {
    DROPS: "Drops",
    CREATED_PLAYLISTS: "Created Playlists",
    LIKED_PLAYLISTS: "Liked Playlists",
    LIKED_TRACKS: "Liked Songs",
  },
};

export const hashRoutes = {
  userProfilesHashRouteNames: {
    [tabMenuRoutes.userProfileTabPages.DROPS]: "drops",
    [tabMenuRoutes.userProfileTabPages.CREATED_PLAYLISTS]: "created-playlists",
    [tabMenuRoutes.userProfileTabPages.LIKED_PLAYLISTS]: "liked-playlists",
    [tabMenuRoutes.userProfileTabPages.LIKED_TRACKS]: "liked-songs",
  },
};

export const externalUrls = {
  solscanTokenDetails: (tokenAddress: string) =>
    `https://solscan.io/token/${tokenAddress}${
      env !== "prod" ? "?cluster=devnet" : ""
    }`,
  solscanAccountDetails: (accountAddress: string) =>
    `https://solscan.io/account/${accountAddress}${
      env !== "prod" ? "?cluster=devnet" : ""
    }`,
};

export const adminWallets = [
  "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
  "ESoydi4GMD3o4KU7Mm1Fn5RoY4kKf2VyDWJzGMBBXg4c",
  "5SBznwYE5GxtcoQjwsthjN9jrb7xuXJCufJmLvVBeR6B", // sadboy wallet
  "3h2MDz4z4zEb71UngawB7pcCrDWN19htAARA6gP123hh",
  "8miKAoCCf13Ui7e4Tphh2GYboe6kCRhuvw7mS8oAzPFH", // brave
  "3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H", //battle treasury
];

export const addresses = {
  allowedWallets: [
    "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
    "5SBznwYE5GxtcoQjwsthjN9jrb7xuXJCufJmLvVBeR6B",
    "27tKyP65v3tXT8h2jj51xT7Rxtr4AUxoMZgzQgHmjyNz",
    "ESoydi4GMD3o4KU7Mm1Fn5RoY4kKf2VyDWJzGMBBXg4c",
    "57f9qEB9CyvszX9ky6LoD5hWnLkaNq7AvVFgGey6hrMK",
    "4i9W3gso6sVFjKC2F7sduuSCjkQfukLziYb3e7YtAqrm",
    "FWeAvUcbkZBNGmVZfAVCFuxGDxVxoraUS2y28LdhP9Uy",
    "AD8nhBxdca5zB9BXRv7RAXHMxoiKzEKGMKDYCa7rgmGr",
    "FZEgipUGXB7FekViqDCDgSpi2dofvGvcZNeZE14pYmae",
    "5fsz1LtbhLKJmPg4G97XJZFhVpmoEXu6Wkb873HH5DXh",
    "bSH3LTTL3WGNVpASgY55X2T9n4RzEBFCbTTdcNAEEeb",
    "GYvec2XEHDo7ESZgaL33Pt7YdBD8KnCG2Y31Wd7aXL9Z",
  ],
  auctionHouse: "5Kq5RpdSvksMMRWX2rXyrFFzkjLDXrgHVkSoPBbBZpaq", // '85mJJtUVk4chbs4vXoKu9rmxmvHaGwPJFJCJ5DjFoJPB',
  // auctioneerAuthority: '81PvMqLd4Ay8PiEawvusEyzYgniFNSMMxtgyFmF4hzbK',
};
// BdX3eN5CWriqBNnVSTwgHGapeobSdNH3vTjVwxjMmZan

export const pinata = {
  pinJSONToIPFSUrl: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
  pinFileToIPFSUrl: "https://api.pinata.cloud/pinning/pinFileToIPFS",
  contentUrl: "https://gateway.pinata.cloud/ipfs/",
};

export const ipfsPublicGateway = "https://ipfs.io/ipfs/"; // use for storage
export const ipfsScheme = "ipfs://"; // use for storage

export const niftyIpfsGateway = "https://niftytunes.myfilebase.com/ipfs/"; // use for storage

export const ipfsPrivateGateway = "https://reamp.mypinata.cloud/ipfs/";

export const liveIpfsGateway = "https://niftytunes.myfilebase.com/ipfs/"; //"https://ipfs.io/ipfs/"; //

export const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "";
// export const liveIpfsGateway = 'https://niftytunes.myfilebase.com/ipfs/';

// export const liveIpfsGateway = 'https://niftytunes.b-cdn.net/ipfs/';

export const authProviderNames = {
  magic: "magic-link",
  solana: "solana-auth",
};

export const array1 = [
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "7vPS1uqZffjVCTj9jhwkPCRda6EVQtwH89AqP5DtkPoZ",
  "11111111111111111111111111111111",
  "7vPS1uqZffjVCTj9jhwkPCRda6EVQtwH89AqP5DtkPoZ",
  "SysvarRent111111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "BLXwEyZDiD4gAYdDUb8P6ma2ECddLapdWUUd61vArCMy",
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "7vPS1uqZffjVCTj9jhwkPCRda6EVQtwH89AqP5DtkPoZ",
  "11111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  "7vPS1uqZffjVCTj9jhwkPCRda6EVQtwH89AqP5DtkPoZ",
  "BLXwEyZDiD4gAYdDUb8P6ma2ECddLapdWUUd61vArCMy",
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "5KMJJsx9RK2G7sCmtVTwUVzjAL1bx7yEzGDSHs6aQrKr",
  "CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR",
  "BkXwtL4fgFc1BxaYwJ6iDYa3oNXBD6JcqTqz9dfpr7FU",
  "vevzhVDVsbnuunHzTZTXNNzfzc2Pf89TaDjtSSpbgPG",
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "7G7M8D1cPG7LB5AqUGpP3tYkbeuh1XVmrCteSfCpAjfh",
  "7vPS1uqZffjVCTj9jhwkPCRda6EVQtwH89AqP5DtkPoZ",
  "D4wK2qaekUKUzXpPTnEDbCNLoJa4EhCXH7mTa2pT5Rur",
  "Eu1SL5WCVNdNeFYRiyMw6zuEwKVND5grZmpP2SVQftgG",
  "2cVkpryQUN35Giwg1nHpGFbi3Gw4A7nYaR5c5pEeP6gx",
  "2V9b4tAG6VWqjLsciyjQWaWWvHgu7wGpNnjYzpSCV3EM",
  "H41nrjKg7PPbyhy3BjKr7px64Kwnd11oSMRWPxw87irg",
  "AX9Xk5UkN3k4ayKdsajec9esztuBpgj7qzQxSoHYkpEK",
  "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "11111111111111111111111111111111",
  "SysvarS1otHashes111111111111111111111111111",
  "Sysvar1nstructions1111111111111111111111111",
  "3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H",
  "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
];

export const array2 = [
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "FnitJ7YV5aWp2yGNJRLD18YpHtvVvWnGSEJh5AyxzMXr",
  "11111111111111111111111111111111",
  "FnitJ7YV5aWp2yGNJRLD18YpHtvVvWnGSEJh5AyxzMXr",
  "SysvarRent111111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "5q6zyewCWUb5CsS6iLHEWHFqn35Nr3zsMD6zdF9Kn2qM",
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "FnitJ7YV5aWp2yGNJRLD18YpHtvVvWnGSEJh5AyxzMXr",
  "11111111111111111111111111111111",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",
  "FnitJ7YV5aWp2yGNJRLD18YpHtvVvWnGSEJh5AyxzMXr",
  "5q6zyewCWUb5CsS6iLHEWHFqn35Nr3zsMD6zdF9Kn2qM",
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "5KMJJsx9RK2G7sCmtVTwUVzjAL1bx7yEzGDSHs6aQrKr",
  "CndyV3LdqHUfDLmE5naZjVN8rBZz4tqhdefbAnjHG3JR",
  "BkXwtL4fgFc1BxaYwJ6iDYa3oNXBD6JcqTqz9dfpr7FU",
  "vevzhVDVsbnuunHzTZTXNNzfzc2Pf89TaDjtSSpbgPG",
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "J4SmY8bKndf6iYPVcpq2dt7s68kh2LHXCoNg7eELyZc8",
  "FnitJ7YV5aWp2yGNJRLD18YpHtvVvWnGSEJh5AyxzMXr",
  "5RJc11HUuKBg8eiBjnLWFKhL5tdEz3VYim3Wjo7QR4iW",
  "G5aEC7Xiy9FR81utjqPXPJFd1ZUTnPyXxHNa6YC4pdqr",
  "2cVkpryQUN35Giwg1nHpGFbi3Gw4A7nYaR5c5pEeP6gx",
  "2V9b4tAG6VWqjLsciyjQWaWWvHgu7wGpNnjYzpSCV3EM",
  "H41nrjKg7PPbyhy3BjKr7px64Kwnd11oSMRWPxw87irg",
  "AX9Xk5UkN3k4ayKdsajec9esztuBpgj7qzQxSoHYkpEK",
  "A8MpM5XxtguzTFbC5VcwqtpHdtcDtfp1fpMqr6AvtrCf",
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s",
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  "11111111111111111111111111111111",
  "SysvarS1otHashes111111111111111111111111111",
  "Sysvar1nstructions1111111111111111111111111",
  "3br7VsdU37pANBsyQs1THULFkTAfZWsQvkqVfWyvA59H",
  "Guard1JwRhJkVH6XZhzoYxeBVQe872VH6QggF4BWmS9g",
];

export const termsConditions =
  "https://app.termly.io/document/terms-of-service/e73d99e0-b345-45cf-afd7-e49c4e3afa67";
export const privacyPolicy =
  "https://app.termly.io/document/privacy-policy/1a9b60aa-402a-4ddf-92e7-867980bce883";
