// Hedera Stablecoin Service - Create and manage stablecoins on Hedera
// Uses @hashgraph/stablecoin-npm-sdk
// Documentation: https://github.com/hashgraph/stablecoin-studio/blob/main/sdk/README.md

import {
  Network,
  StableCoinCapabilities,
  StableCoinViewModel,
  Environment,
  CreateRequest,
  ConnectRequest,
  Account,
  MirrorNode,
  JsonRpcRelay,
  RequestSupplyType,
  RequestDecimal,
} from "@hashgraph/stablecoin-npm-sdk";

/**
 * Hedera Stablecoin Service
 * Handles creation and management of ERC-20 stablecoins on Hedera
 */
class HederaStablecoinService {
  constructor() {
    this.isInitialized = false;
    this.environment = null;
    this.connectedAccount = null;
  }

  /**
   * Initialize the SDK with Hedera Testnet configuration
   * @param {string} accountId - Your Hedera account ID (e.g., "0.0.123456")
   * @param {string} privateKey - Your Hedera account private key
   * @returns {Promise<boolean>}
   */
  async initialize(accountId, privateKey) {
    try {
      console.log("🔄 Initializing Hedera Stablecoin SDK...");

      // Configure Hedera Testnet environment
      const mirrorNode = {
        name: "Hedera Testnet Mirror Node",
        network: Network.TESTNET,
        baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
      };

      const rpcNode = {
        name: "Hedera Testnet JSON-RPC",
        network: Network.TESTNET,
        baseUrl: "https://testnet.hashio.io/api",
      };

      // Initialize environment
      this.environment = await Environment.init({
        network: Network.TESTNET,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
      });

      // Connect account
      this.connectedAccount = new Account({
        accountId: accountId,
        privateKey: privateKey,
      });

      await ConnectRequest.connectAccount(this.connectedAccount);

      this.isInitialized = true;
      console.log("✅ Hedera Stablecoin SDK initialized successfully");
      console.log(`📱 Connected account: ${accountId}`);

      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Hedera Stablecoin SDK:", error);
      throw error;
    }
  }

  /**
   * Create a new 6-decimal stablecoin on Hedera Testnet
   * @param {Object} config - Stablecoin configuration
   * @param {string} config.name - Token name (e.g., "USD Digital")
   * @param {string} config.symbol - Token symbol (e.g., "USDd")
   * @param {string} config.initialSupply - Initial supply (e.g., "1000000")
   * @param {string} config.maxSupply - Max supply (optional)
   * @returns {Promise<Object>} - Created stablecoin details
   */
  async createStablecoin(config) {
    if (!this.isInitialized) {
      throw new Error(
        "SDK not initialized. Call initialize() first with your account credentials."
      );
    }

    try {
      console.log("🪙 Creating stablecoin:", config.name);

      // Build creation request with 6 decimals
      const createRequest = new CreateRequest({
        name: config.name,
        symbol: config.symbol,
        decimals: 6, // ✅ 6 DECIMALS - STABLECOIN STANDARD
        initialSupply: config.initialSupply || "0",
        maxSupply: config.maxSupply || "0",
        supplyType: config.maxSupply
          ? RequestSupplyType.FINITE
          : RequestSupplyType.INFINITE,
        autoRenewAccount: this.connectedAccount.accountId,
        freezeDefault: false, // Don't freeze accounts by default
        kycRequired: false, // Don't require KYC by default
        memo: `AgentSphere Stablecoin - ${config.symbol}`,
      });

      // Create the stablecoin
      const stablecoin = await StableCoinViewModel.create(createRequest);

      console.log("✅ Stablecoin created successfully!");
      console.log(`📝 Token ID: ${stablecoin.tokenId}`);
      console.log(`💰 Symbol: ${stablecoin.symbol}`);
      console.log(`🔢 Decimals: ${stablecoin.decimals}`);
      console.log(`📊 Initial Supply: ${stablecoin.totalSupply}`);

      // Get EVM-compatible contract address
      const evmAddress = await this.getEVMAddress(stablecoin.tokenId);

      return {
        success: true,
        tokenId: stablecoin.tokenId, // Hedera format (0.0.XXXXX)
        evmAddress: evmAddress, // EVM format (0x...)
        name: stablecoin.name,
        symbol: stablecoin.symbol,
        decimals: stablecoin.decimals,
        initialSupply: stablecoin.totalSupply,
        maxSupply: stablecoin.maxSupply,
        network: "Hedera Testnet",
        chainId: 296,
        explorer: `https://hashscan.io/testnet/token/${stablecoin.tokenId}`,
      };
    } catch (error) {
      console.error("❌ Failed to create stablecoin:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Convert Hedera token ID to EVM-compatible address
   * @param {string} tokenId - Hedera token ID (e.g., "0.0.123456")
   * @returns {Promise<string>} - EVM address (0x...)
   */
  async getEVMAddress(tokenId) {
    try {
      // Hedera token IDs can be converted to EVM addresses
      // Format: 0.0.XXXXX -> 0x00000000000000000000000000000000000XXXXX

      const parts = tokenId.split(".");
      const tokenNum = parseInt(parts[2]);

      // Convert to hex and pad to 40 characters (20 bytes)
      const evmAddress =
        "0x" + tokenNum.toString(16).padStart(40, "0").toLowerCase();

      console.log(`🔄 Converted ${tokenId} -> ${evmAddress}`);
      return evmAddress;
    } catch (error) {
      console.error("❌ Failed to convert token ID to EVM address:", error);
      throw error;
    }
  }

  /**
   * Get stablecoin details by token ID
   * @param {string} tokenId - Hedera token ID
   * @returns {Promise<Object>}
   */
  async getStablecoinDetails(tokenId) {
    try {
      const stablecoin = await StableCoinViewModel.getInfo(tokenId);

      return {
        tokenId: stablecoin.tokenId,
        name: stablecoin.name,
        symbol: stablecoin.symbol,
        decimals: stablecoin.decimals,
        totalSupply: stablecoin.totalSupply,
        maxSupply: stablecoin.maxSupply,
        treasury: stablecoin.treasury,
        evmAddress: await this.getEVMAddress(tokenId),
      };
    } catch (error) {
      console.error("❌ Failed to get stablecoin details:", error);
      throw error;
    }
  }

  /**
   * Mint new tokens (Cash In operation)
   * @param {string} tokenId - Hedera token ID
   * @param {string} amount - Amount to mint
   * @param {string} targetAccount - Account to receive tokens
   * @returns {Promise<Object>}
   */
  async mintTokens(tokenId, amount, targetAccount) {
    try {
      console.log(`💰 Minting ${amount} tokens to ${targetAccount}`);

      const result = await StableCoinViewModel.cashIn({
        tokenId: tokenId,
        amount: amount,
        targetId: targetAccount,
      });

      console.log("✅ Tokens minted successfully!");
      return {
        success: true,
        transactionId: result.transactionId,
        amount: amount,
      };
    } catch (error) {
      console.error("❌ Failed to mint tokens:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check token balance
   * @param {string} tokenId - Hedera token ID
   * @param {string} accountId - Account to check
   * @returns {Promise<string>}
   */
  async getBalance(tokenId, accountId) {
    try {
      const balance = await StableCoinViewModel.getBalance({
        tokenId: tokenId,
        targetId: accountId,
      });

      console.log(`💰 Balance: ${balance} for account ${accountId}`);
      return balance;
    } catch (error) {
      console.error("❌ Failed to get balance:", error);
      throw error;
    }
  }

  /**
   * Get stablecoin creation guide
   * @returns {Object} - Step-by-step guide
   */
  getCreationGuide() {
    return {
      title: "Create 6-Decimal Stablecoin on Hedera Testnet",
      steps: [
        {
          step: 1,
          description: "Get Hedera Testnet Account",
          action:
            "Visit https://portal.hedera.com/ to create a testnet account",
          note: "You'll receive an Account ID (0.0.XXXXX) and Private Key",
        },
        {
          step: 2,
          description: "Initialize SDK",
          code: `
const stablecoinService = new HederaStablecoinService();
await stablecoinService.initialize(
  "0.0.YOUR_ACCOUNT_ID",
  "YOUR_PRIVATE_KEY"
);
          `,
        },
        {
          step: 3,
          description: "Create Stablecoin",
          code: `
const result = await stablecoinService.createStablecoin({
  name: "USD Digital",
  symbol: "USDd",
  initialSupply: "1000000", // 1 million tokens
  maxSupply: "10000000" // 10 million max (optional)
});

console.log("Token ID:", result.tokenId);
console.log("EVM Address:", result.evmAddress);
          `,
        },
        {
          step: 4,
          description: "Update AgentSphere Config",
          note: "Use the EVM address in your agent deployment configuration",
        },
      ],
      example: {
        name: "USD Digital",
        symbol: "USDd",
        decimals: 6,
        initialSupply: "1000000",
        expectedEvmFormat: "0x00000000000000000000000000000000006dba7f",
      },
    };
  }
}

export const hederaStablecoinService = new HederaStablecoinService();
export default hederaStablecoinService;
