// Hedera Testnet configuration for AR viewer
// Updated for custom stablecoin support (USDh and others)

export const HederaTestnet = {
  chainId: "0x128", // 296 in hex
  chainName: "Hedera Testnet",
  nativeCurrency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18, // Hedera native token (NOT used for payments)
  },
  rpcUrls: ["https://testnet.hashio.io/api"],
  blockExplorerUrls: ["https://hashscan.io/testnet"],
};

export const HederaTestnetConfig = {
  name: "Hedera Testnet",
  chainId: 296,
  rpc: "https://testnet.hashio.io/api",
  explorer: "https://hashscan.io/testnet",
  currency: {
    name: "HBAR",
    symbol: "HBAR",
    decimals: 18,
  },
  // Custom stablecoins for payments
  paymentTokens: {
    USDh: {
      address: "0x00000000000000000000000000000000006e24c7",
      decimals: 6,
      symbol: "USDh",
      name: "USDh Stablecoin",
      status: "DEPLOYED",
    },
  },
};

export const HEDERA_PAYMENT_CONFIG = {
  defaultToken: "USDh", // Default payment token
  interactionFee: 10, // 10 USDh per agent interaction (was 1 HBAR)
  gasLimit: 100000, // Higher gas limit for ERC-20 transfers
  paymentType: "ERC20", // ERC-20 token payments only
};
