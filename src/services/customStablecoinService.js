// Custom Stablecoin Service
// Handles USDh and future custom stablecoins for AgentSphere
// All custom stablecoins use 6 decimals (ERC-20 standard)

import stablecoinRegistry from "../config/stablecoin-registry.json";
import ccipConfigConsolidated from "../config/ccip-config-consolidated.json";

class CustomStablecoinService {
  constructor() {
    this.registry = stablecoinRegistry;
    this.placeholderAddress = "0x0000000000000000000000000000000000000000";
  }

  /**
   * Get all deployed custom stablecoins for a specific network
   * @param {number} chainId - Network chain ID
   * @returns {Object} Map of deployed stablecoins { symbol: config }
   */
  getDeployedStablecoins(chainId) {
    const deployedTokens = {};

    Object.entries(this.registry.stablecoins).forEach(([symbol, config]) => {
      if (
        config.status === "DEPLOYED" &&
        config.deployedNetworks[this.getNetworkName(chainId)]
      ) {
        const networkConfig =
          config.deployedNetworks[this.getNetworkName(chainId)];
        deployedTokens[symbol] = {
          ...config,
          contractAddress: networkConfig.contractAddress,
          chainId: chainId,
        };
      }
    });

    return deployedTokens;
  }

  /**
   * Get stablecoin configuration by symbol and network
   * @param {string} symbol - Token symbol (e.g., "USDh")
   * @param {number} chainId - Network chain ID
   * @returns {Object|null} Token configuration or null if not found
   */
  getStablecoin(symbol, chainId) {
    const stablecoin = this.registry.stablecoins[symbol];
    if (!stablecoin) {
      console.warn(`⚠️ Stablecoin ${symbol} not found in registry`);
      return null;
    }

    const networkName = this.getNetworkName(chainId);
    const networkConfig = stablecoin.deployedNetworks[networkName];

    if (!networkConfig) {
      console.warn(
        `⚠️ Stablecoin ${symbol} not deployed on network ${networkName} (${chainId})`
      );
      return null;
    }

    return {
      symbol: stablecoin.symbol,
      name: stablecoin.name,
      decimals: stablecoin.decimals,
      contractAddress: networkConfig.contractAddress,
      status: stablecoin.status,
      icon: stablecoin.icon,
      chainId: chainId,
      verified: networkConfig.verified,
    };
  }

  /**
   * Get custom stablecoins from CCIP config for a network
   * @param {number} chainId - Network chain ID
   * @returns {Object} Map of custom stablecoins from CCIP config
   */
  getCustomStablecoinsFromCCIP(chainId) {
    const networkName = this.getNetworkName(chainId);
    const networkConfig = ccipConfigConsolidated.chains[networkName];

    if (!networkConfig || !networkConfig.customStablecoins) {
      console.warn(
        `⚠️ No custom stablecoins configured for ${networkName} (${chainId})`
      );
      return {};
    }

    return networkConfig.customStablecoins;
  }

  /**
   * Get token address for a specific stablecoin on a network
   * @param {string} symbol - Token symbol
   * @param {number} chainId - Network chain ID
   * @returns {string|null} Contract address or null
   */
  getTokenAddress(symbol, chainId) {
    const stablecoin = this.getStablecoin(symbol, chainId);
    return stablecoin ? stablecoin.contractAddress : null;
  }

  /**
   * Check if a token is deployed (not placeholder address)
   * @param {string} address - Contract address
   * @returns {boolean} True if deployed, false if placeholder
   */
  isDeployed(address) {
    return address && address !== this.placeholderAddress;
  }

  /**
   * Validate token before use
   * @param {string} symbol - Token symbol
   * @param {number} chainId - Network chain ID
   * @throws {Error} If token is not deployed or invalid
   */
  validateToken(symbol, chainId) {
    const stablecoin = this.getStablecoin(symbol, chainId);

    if (!stablecoin) {
      throw new Error(`Token ${symbol} is not configured for chain ${chainId}`);
    }

    if (!this.isDeployed(stablecoin.contractAddress)) {
      throw new Error(
        `${symbol} is not yet deployed on ${this.getNetworkName(chainId)}. ` +
          `Please select a different payment token or wait for deployment.`
      );
    }

    if (stablecoin.status !== "DEPLOYED") {
      throw new Error(
        `${symbol} status is ${stablecoin.status}. Only DEPLOYED tokens can be used for payments.`
      );
    }

    return true;
  }

  /**
   * Get network name from chain ID
   * @param {number} chainId
   * @returns {string} Network name
   */
  getNetworkName(chainId) {
    const networkMap = {
      296: "HederaTestnet",
      11155111: "EthereumSepolia",
      421614: "ArbitrumSepolia",
      84532: "BaseSepolia",
      11155420: "OPSepolia",
      43113: "AvalancheFuji",
      80002: "PolygonAmoy",
    };
    return networkMap[chainId] || `Unknown_${chainId}`;
  }

  /**
   * Get default payment token for a network
   * @param {number} chainId - Network chain ID
   * @returns {string|null} Default token symbol
   */
  getDefaultPaymentToken(chainId) {
    const networkName = this.getNetworkName(chainId);
    const networkConfig = ccipConfigConsolidated.chains[networkName];
    return networkConfig?.defaultPaymentToken || null;
  }

  /**
   * Get all stablecoins (deployed + planned) for a network
   * @param {number} chainId - Network chain ID
   * @returns {Array} Array of stablecoin configs
   */
  getAllStablecoins(chainId) {
    const customStablecoins = this.getCustomStablecoinsFromCCIP(chainId);
    return Object.entries(customStablecoins).map(([symbol, config]) => ({
      symbol,
      ...config,
      isDeployed: this.isDeployed(config.tokenAddress),
    }));
  }

  /**
   * Format token amount with correct decimals
   * @param {number|string} amount - Amount in human-readable format
   * @param {string} symbol - Token symbol (defaults to 6 decimals)
   * @returns {string} Amount in smallest unit (e.g., 10.5 USDh -> "10500000")
   */
  formatAmount(amount, symbol = null) {
    const decimals = 6; // All custom stablecoins use 6 decimals
    const parsedAmount = parseFloat(amount);
    const amountInSmallestUnit = Math.floor(
      parsedAmount * Math.pow(10, decimals)
    );
    return amountInSmallestUnit.toString();
  }

  /**
   * Parse token amount from smallest unit to human-readable
   * @param {string|number} amount - Amount in smallest unit
   * @param {string} symbol - Token symbol
   * @returns {number} Amount in human-readable format
   */
  parseAmount(amount, symbol = null) {
    const decimals = 6; // All custom stablecoins use 6 decimals
    return parseFloat(amount) / Math.pow(10, decimals);
  }

  /**
   * Get stablecoin icon
   * @param {string} symbol - Token symbol
   * @returns {string} Icon emoji
   */
  getIcon(symbol) {
    const stablecoin = this.registry.stablecoins[symbol];
    return stablecoin?.icon || "💎";
  }
}

// Export singleton instance
const customStablecoinService = new CustomStablecoinService();
export default customStablecoinService;
