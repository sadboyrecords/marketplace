interface ISupporters {
  [key: string]: {
    walletAddress: string;
    tokenAddress: string;
    user: {
      walletAddress: string;
      magicSolanaAddress: string;
      name?: string;
      firstName?: string;
      pinnedProfilePicture: {
        ipfsHash: string;
        width: number;
        height: number;
        originalUrl: string;
        path: string;
        status: string;
      };
    };
  }[];
}

interface TransactionDetails {
  walletAddress: {
    solana: string;
  };
  sourceCurrency?: string;
  destinationCurrency?: "sol";
  destinationNetwork?: "solana";
  destinationExchangeAmount?: string;
}

interface StripeOnrampSessionRequest {
  transactionDetails: TransactionDetails;
  customerInformation?: {
    email?: string;
    firstName?: string;
    lastName?: string;
    dob?: {
      day: number;
      month: number;
      year: number;
    };
    address?: {
      country: string;
      state?: string;
      city?: string;
      line1?: string;
      line2?: string;
      postalCode?: string;
    };
  };
}
