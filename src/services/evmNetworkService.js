// EVM Network Service - USDC Contract Address Mapping for Testnets
// This service provides USDC contract addresses for different EVM testnets

const EVM_TESTNETS = {
  // Chain ID to USDC contract mapping
  11155111: {
    // Ethereum Sepolia
    name: "Ethereum Sepolia",
    usdc_contract: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    rpc_url: "sepolia.infura.io",
    currency_symbol: "SepoliaETH",
  },
  421614: {
    // Arbitrum Sepolia
    name: "Arbitrum Sepolia",
    usdc_contract: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d",
    rpc_url: "api.zan.top/arb-sepolia",
    currency_symbol: "ETH",
  },
  84532: {
    // Base Sepolia
    name: "Base Sepolia",
    usdc_contract: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    rpc_url: "sepolia.base.org",
    currency_symbol: "ETH",
  },
  11155420: {
    // OP Sepolia
    name: "OP Sepolia",
    usdc_contract: "0x5fd84259d3c8b37a387c0d8a4c5b0c0d7d3c0D7",
    rpc_url: "sepolia.optimism.io",
    currency_symbol: "ETH",
  },
  43113: {
    // Avalanche Fuji
    name: "Avalanche Fuji",
    usdc_contract: "0x5425890298aed601595a70AB815c96711a31Bc65",
    rpc_url: "api.avax-test.network/ext/bc/C/rpc",
    currency_symbol: "AVAX",
  },
};

/**
 * Get USDC contract address for a specific chain ID
 * @param {number} chainId - The blockchain chain ID
 * @returns {string|null} USDC contract address or null if not found
 */
export const getUSDCContractForChain = (chainId) => {
  const network = EVM_TESTNETS[chainId];
  return network ? network.usdc_contract : null;
};

/**
 * Get network information for a specific chain ID
 * @param {number} chainId - The blockchain chain ID
 * @returns {object|null} Network information object or null if not found
 */
export const getNetworkInfo = (chainId) => {
  return EVM_TESTNETS[chainId] || null;
};

/**
 * Get all supported testnet chain IDs
 * @returns {number[]} Array of supported chain IDs
 */
export const getSupportedChainIds = () => {
  return Object.keys(EVM_TESTNETS).map(Number);
};

/**
 * Check if a chain ID is supported
 * @param {number} chainId - The blockchain chain ID
 * @returns {boolean} True if chain is supported
 */
export const isChainSupported = (chainId) => {
  return chainId in EVM_TESTNETS;
};

/**
 * Get all supported networks
 * @returns {object} Object with chain IDs as keys and network info as values
 */
export const getAllNetworks = () => {
  return EVM_TESTNETS;
};

export default {
  getUSDCContractForChain,
  getNetworkInfo,
  getSupportedChainIds,
  isChainSupported,
  getAllNetworks,
};
