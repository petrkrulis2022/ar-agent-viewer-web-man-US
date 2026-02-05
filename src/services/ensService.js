import { ethers } from "ethers";

/**
 * ENS Service for AR Viewer
 * Resolves ENS domains to Ethereum addresses
 * Shared constants with AgentSphere for consistency
 */

// Shared constants (aligned with AgentSphere)
export const ENS_CONFIG = {
  CACHE_TIMEOUT: 3600000, // 1 hour in milliseconds
  DEBOUNCE_DELAY: 800, // 800ms for input debounce
  RESOLUTION_TIMEOUT: 5000, // 5 seconds max resolution time
  DEFAULT_NETWORK: "mainnet",
  SUPPORTED_NETWORKS: ["mainnet", "sepolia"],
  ICON: "🌐",
  COLOR: "#5298ff",
  MIN_DOMAIN_LENGTH: 3,
  MAX_DOMAIN_LENGTH: 255,
};

// Shared RPC endpoints for ENS resolution
const RPC_ENDPOINTS = {
  mainnet: [
    "https://eth.llamarpc.com", // Primary
    "https://rpc.ankr.com/eth", // Fallback 1
    "https://ethereum.publicnode.com", // Fallback 2
  ],
  sepolia: [
    "https://ethereum-sepolia-rpc.publicnode.com", // Primary (verified working)
    "https://rpc.ankr.com/eth_sepolia", // Fallback
  ],
};

// Network configurations for StaticJsonRpcProvider
// ENS Registry address is the same on mainnet and Sepolia
const ENS_REGISTRY_ADDRESS = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

const NETWORK_CONFIGS = {
  mainnet: {
    name: "homestead",
    chainId: 1,
    ensAddress: ENS_REGISTRY_ADDRESS,
  },
  sepolia: {
    name: "sepolia",
    chainId: 11155111,
    ensAddress: ENS_REGISTRY_ADDRESS,
  },
};

/**
 * ENS Service class for resolving domains
 */
class ENSService {
  constructor(network = "mainnet") {
    this.network = network;
    this.cache = new Map();
    this.cacheTimeout = ENS_CONFIG.CACHE_TIMEOUT;
    this.stats = { hits: 0, misses: 0, errors: 0 };

    // Use StaticJsonRpcProvider with explicit network config to avoid detection errors
    const rpcUrl = RPC_ENDPOINTS[network]?.[0] || RPC_ENDPOINTS.mainnet[0];
    const networkConfig = NETWORK_CONFIGS[network] || NETWORK_CONFIGS.mainnet;

    this.provider = new ethers.providers.StaticJsonRpcProvider(
      rpcUrl,
      networkConfig,
    );

    console.log(
      `🌐 [ENS Service] Initialized for ${network} network using ${rpcUrl}`,
    );
  }

  /**
   * Resolve ENS domain to Ethereum address
   * @param {string} domain - ENS domain (e.g., "vitalik.eth")
   * @returns {Promise<Object>} Resolution result with address or error
   */
  async resolveENS(domain) {
    try {
      console.log(`🔍 [ENS] Resolving domain: ${domain}`);

      // Validate domain format
      if (!this.isValidENSDomain(domain)) {
        throw new Error("Invalid ENS domain - must end with .eth");
      }

      // Check cache
      const cached = this.getFromCache(domain);
      if (cached) {
        this.stats.hits++;
        console.log(`✅ [ENS] Using cached address for ${domain}`);
        return {
          success: true,
          address: cached,
          network: this.network,
          timestamp: new Date(),
          cached: true,
        };
      }

      this.stats.misses++;

      // Resolve using ethers.js with timeout
      const address = await Promise.race([
        this.provider.resolveName(domain),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Resolution timeout")),
            ENS_CONFIG.RESOLUTION_TIMEOUT,
          ),
        ),
      ]);

      if (!address) {
        throw new Error("ENS domain not found or not configured");
      }

      if (!ethers.utils.isAddress(address)) {
        throw new Error("Invalid address returned from ENS resolver");
      }

      // Cache the result
      this.addToCache(domain, address);

      console.log(`✅ [ENS] Resolved: ${domain} → ${address}`);

      return {
        success: true,
        address: address,
        network: this.network,
        timestamp: new Date(),
        cached: false,
      };
    } catch (error) {
      this.stats.errors++;
      console.error(`❌ [ENS] Resolution failed:`, error);
      return {
        success: false,
        error: error.message,
        network: this.network,
        timestamp: new Date(),
      };
    }
  }

  /**
   * Reverse resolve address to ENS name
   * @param {string} address - Ethereum address
   * @returns {Promise<Object>} ENS name if found
   */
  async reverseResolve(address) {
    try {
      if (!ethers.utils.isAddress(address)) {
        throw new Error("Invalid Ethereum address");
      }

      console.log(`🔍 [ENS] Reverse resolving: ${address}`);

      const name = await Promise.race([
        this.provider.lookupAddress(address),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Reverse resolution timeout")),
            ENS_CONFIG.RESOLUTION_TIMEOUT,
          ),
        ),
      ]);

      if (!name) {
        return {
          success: false,
          error: "No ENS name found for this address",
        };
      }

      console.log(`✅ [ENS] Reverse resolved: ${address} → ${name}`);
      return {
        success: true,
        name: name,
      };
    } catch (error) {
      console.error("❌ [ENS] Reverse lookup failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Validate ENS domain format
   * @param {string} domain - Domain to validate
   * @returns {boolean} true if valid format
   */
  isValidENSDomain(domain) {
    if (!domain) return false;
    if (!domain.endsWith(".eth")) return false;
    if (domain === ".eth") return false;
    if (
      domain.length < ENS_CONFIG.MIN_DOMAIN_LENGTH ||
      domain.length > ENS_CONFIG.MAX_DOMAIN_LENGTH
    )
      return false;

    // Basic character validation (alphanumeric, hyphen, dot)
    const regex = /^[a-z0-9.-]+\.eth$/i;
    return regex.test(domain);
  }

  /**
   * Get cached resolution
   * @private
   */
  getFromCache(domain) {
    const cached = this.cache.get(domain.toLowerCase());
    if (!cached) return null;

    // Check if cache expired
    const now = Date.now();
    if (now - cached.timestamp > this.cacheTimeout) {
      this.cache.delete(domain.toLowerCase());
      return null;
    }

    return cached.address;
  }

  /**
   * Add to cache
   * @private
   */
  addToCache(domain, address) {
    this.cache.set(domain.toLowerCase(), {
      address,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache() {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️ [ENS] Cleared cache (${size} entries removed)`);
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      hits: this.stats.hits,
      misses: this.stats.misses,
      errors: this.stats.errors,
      hitRate:
        this.stats.hits + this.stats.misses > 0
          ? (this.stats.hits / (this.stats.hits + this.stats.misses)) * 100
          : 0,
    };
  }

  /**
   * Get current network
   * @returns {string} Network name
   */
  getNetwork() {
    return this.network;
  }

  /**
   * Switch network
   * @param {string} network - New network ('mainnet' or 'sepolia')
   */
  switchNetwork(network) {
    if (!ENS_CONFIG.SUPPORTED_NETWORKS.includes(network)) {
      throw new Error(`Unsupported network: ${network}`);
    }

    this.network = network;
    const rpcUrl = RPC_ENDPOINTS[network]?.[0] || RPC_ENDPOINTS.mainnet[0];
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.clearCache(); // Clear cache when switching networks

    console.log(`🔄 [ENS Service] Switched to ${network} network`);
  }
}

// Singleton instances (aligned with AgentSphere)
export const ensService = new ENSService("mainnet");
export const ensServiceSepolia = new ENSService("sepolia");

/**
 * Utility function for simple ENS resolution
 * @param {string} domain - ENS domain to resolve
 * @param {string} network - Network to use ('mainnet' or 'sepolia')
 * @returns {Promise<string|null>} Resolved address or null
 */
export const resolveENSToAddress = async (domain, network = "mainnet") => {
  const service = network === "mainnet" ? ensService : ensServiceSepolia;
  const result = await service.resolveENS(domain);
  return result.success ? result.address : null;
};

/**
 * Test ENS domains (shared across both codebases)
 */
export const TEST_DOMAINS = {
  mainnet: [
    "vitalik.eth", // Resolves to real address
    "nick.eth", // Has avatar
    "brantly.eth", // ENS founder
  ],
  sepolia: [
    "test.eth", // Generic test domain
    "demo.eth", // Demo purposes
  ],
  invalid: [
    "notregistered.eth", // Should fail gracefully
    "invalid", // No TLD
    "0x123", // Not ENS format
    "", // Empty string
  ],
};

export default ENSService;
