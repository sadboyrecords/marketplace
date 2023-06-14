export const env = process.env.NEXT_PUBLIC_ENV;

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

export const battleDropsTreasury = process.env.NEXT_PUBLIC_BATTLE_TREASURY;

export const globalMeta = {
  siteName: "NiftyTunes",
  siteUrl: "https://www.niftytunes.xyz/",
  siteLogo: "/logo/icon_1000.png",
  // email: "email@yoursite.com",
  description: "Your one stop shop for Music NFTs on SOLANA",
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

export const ipfsPrivateGateway = "https://reamp.mypinata.cloud/ipfs/";

export const liveIpfsGateway = "https://niftytunes.myfilebase.com/ipfs/"; //"https://ipfs.io/ipfs/"; //

export const cdnUrl = process.env.NEXT_PUBLIC_CDN_URL || "";
// export const liveIpfsGateway = 'https://niftytunes.myfilebase.com/ipfs/';

// export const liveIpfsGateway = 'https://niftytunes.b-cdn.net/ipfs/';

export const authProviderNames = {
  magic: "magic-link",
  solana: "solana-auth",
};
