// CCIP Configuration Service for Cross-Chain Transfers
// Manages CCIP network configurations, fee estimation, and transaction building
// Built for AR Viewer Phase 2 - CCIP Cross-Chain Implementation

import { ethers } from "ethers";
import BigNumber from "bignumber.js";
import ccipConfig from "../config/ccip-config.json";

// CCIP Router ABI for encoding transactions
const CCIP_ROUTER_ABI = [
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "ccipSend",
    outputs: [
      {
        internalType: "bytes32",
        name: "messageId",
        type: "bytes32",
      },
    ],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint64",
        name: "destinationChainSelector",
        type: "uint64",
      },
      {
        components: [
          {
            internalType: "bytes",
            name: "receiver",
            type: "bytes",
          },
          {
            internalType: "bytes",
            name: "data",
            type: "bytes",
          },
          {
            components: [
              {
                internalType: "address",
                name: "token",
                type: "address",
              },
              {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
              },
            ],
            internalType: "struct Client.EVMTokenAmount[]",
            name: "tokenAmounts",
            type: "tuple[]",
          },
          {
            internalType: "address",
            name: "feeToken",
            type: "address",
          },
          {
            internalType: "bytes",
            name: "extraArgs",
            type: "bytes",
          },
        ],
        internalType: "struct Client.EVM2AnyMessage",
        name: "message",
        type: "tuple",
      },
    ],
    name: "getFee",
    outputs: [
      {
        internalType: "uint256",
        name: "fee",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

class CCIPConfigService {
  constructor() {
    this.networkConfigs = new Map();
    this.routerABI = CCIP_ROUTER_ABI;
    this.initialized = false;
    this.supportedRoutes = new Set();

    // Initialize configurations from JSON
    this.initializeConfigurations();
  }

  /**
   * Initialize network configurations from ccip-config.json
   */
  initializeConfigurations() {
    try {
      // Load EVM networks
      const evmNetworks = [
        "EthereumSepolia",
        "ArbitrumSepolia",
        "OPSepolia",
        "BaseSepolia",
        "AvalancheFuji",
        "PolygonAmoy",
      ];

      evmNetworks.forEach((networkName) => {
        const config = ccipConfig[networkName];
        if (config) {
          this.networkConfigs.set(config.chainId, {
            chainId: config.chainId,
            chainName: config.chainName,
            chainSelector: config.chainSelector,
            router: config.router,
            usdc: config.usdc,
            lanes: config.lanes,
            rpcUrl: config.rpcUrl,
            currencySymbol: config.currencySymbol,
            feeTokens: config.feeTokens,
            type: "EVM",
          });
        }
      });

      // Load Solana network
      const solanaConfig = ccipConfig.SolanaDevnet;
      if (solanaConfig) {
        this.networkConfigs.set("devnet", {
          chainId: "devnet",
          chainName: solanaConfig.chainName,
          chainSelector: solanaConfig.chainSelector,
          router: solanaConfig.router,
          usdc: solanaConfig.usdc,
          lanes: solanaConfig.lanes,
          rpcUrl: solanaConfig.rpcUrl,
          currencySymbol: solanaConfig.currencySymbol,
          feeTokens: solanaConfig.feeTokens,
          type: "Solana",
        });
      }

      // Initialize supported routes
      this.initializeSupportedRoutes();

      this.initialized = true;
      console.log(
        "✅ CCIP Configuration Service initialized with",
        this.networkConfigs.size,
        "networks"
      );
      console.log(
        "✅ Total supported cross-chain routes:",
        this.supportedRoutes.size
      );
    } catch (error) {
      console.error("❌ Failed to initialize CCIP configurations:", error);
      throw error;
    }
  }

  /**
   * Initialize supported cross-chain routes
   */
  initializeSupportedRoutes() {
    // EVM to EVM routes
    ccipConfig.supportedRoutes.evmToEvm.forEach((route) => {
      this.supportedRoutes.add(route);
    });

    // EVM to Solana routes
    ccipConfig.supportedRoutes.evmToSolana.forEach((route) => {
      this.supportedRoutes.add(route);
    });

    // Solana to EVM routes
    ccipConfig.supportedRoutes.solanaToEvm.forEach((route) => {
      this.supportedRoutes.add(route);
    });
  }

  /**
   * Get network configuration by chain ID
   * @param {string|number} chainId - The chain ID
   * @returns {Object|null} Network configuration
   */
  getNetworkConfig(chainId) {
    return this.networkConfigs.get(chainId.toString()) || null;
  }

  /**
   * Check if cross-chain transfer is needed
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @returns {boolean} True if cross-chain transfer needed
   */
  isCrossChainTransfer(sourceChain, destinationChain) {
    return sourceChain.toString() !== destinationChain.toString();
  }

  /**
   * Check if a cross-chain route is supported
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @returns {boolean} True if route is supported
   */
  isRouteSupported(sourceChain, destinationChain) {
    const sourceConfig = this.getNetworkConfig(sourceChain);
    const destConfig = this.getNetworkConfig(destinationChain);

    if (!sourceConfig || !destConfig) {
      return false;
    }

    const routeKey = `${sourceConfig.chainName}->${destConfig.chainName}`;
    return this.supportedRoutes.has(routeKey);
  }

  /**
   * Get available destination networks for a source network
   * @param {string|number} sourceChain - Source chain ID
   * @returns {Array} Array of supported destination networks
   */
  getAvailableDestinations(sourceChain) {
    const sourceConfig = this.getNetworkConfig(sourceChain);
    if (!sourceConfig) {
      return [];
    }

    const destinations = [];
    this.networkConfigs.forEach((config, chainId) => {
      if (
        chainId !== sourceChain.toString() &&
        this.isRouteSupported(sourceChain, chainId)
      ) {
        destinations.push({
          chainId: config.chainId,
          chainName: config.chainName,
          currencySymbol: config.currencySymbol,
          type: config.type,
        });
      }
    });

    return destinations;
  }

  /**
   * Estimate CCIP transfer fees
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @param {string} amount - USDC amount in human readable format
   * @param {string} recipient - Recipient address on destination chain
   * @param {string} feeToken - Fee token preference ('native', 'LINK')
   * @returns {Promise<Object>} Fee estimation result
   */
  async estimateCCIPFees(
    sourceChain,
    destinationChain,
    amount,
    recipient,
    feeToken = "native"
  ) {
    try {
      if (!this.isCrossChainTransfer(sourceChain, destinationChain)) {
        throw new Error("Not a cross-chain transfer");
      }

      if (!this.isRouteSupported(sourceChain, destinationChain)) {
        throw new Error("Cross-chain route not supported");
      }

      const sourceConfig = this.getNetworkConfig(sourceChain);
      const destConfig = this.getNetworkConfig(destinationChain);

      // Build CCIP message
      const message = this.buildCCIPMessage(
        recipient,
        amount,
        sourceConfig,
        destConfig,
        feeToken
      );

      // For now, return estimated fees based on network
      // In production, this would call the actual router contract
      const estimatedFee = this.getEstimatedFeeForRoute(
        sourceChain,
        destinationChain
      );

      return {
        success: true,
        sourceChain: sourceConfig.chainName,
        destinationChain: destConfig.chainName,
        amount: amount,
        estimatedFee: estimatedFee,
        feeToken: feeToken,
        message: message,
        routerAddress: sourceConfig.router,
        gasLimit: "200000",
      };
    } catch (error) {
      console.error("❌ CCIP fee estimation failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Build CCIP message for cross-chain transfer
   * @param {string} recipient - Recipient address
   * @param {string} amount - USDC amount
   * @param {Object} sourceConfig - Source network config
   * @param {Object} destConfig - Destination network config
   * @param {string} feeToken - Fee token preference
   * @returns {Object} CCIP message object
   */
  buildCCIPMessage(recipient, amount, sourceConfig, destConfig, feeToken) {
    // Convert amount to wei (USDC has 6 decimals)
    const amountWei = ethers.utils.parseUnits(amount.toString(), 6);

    // Determine fee token address
    let feeTokenAddress;
    if (feeToken === "native") {
      feeTokenAddress = ethers.constants.AddressZero; // Use native token
    } else if (feeToken === "LINK" && sourceConfig.feeTokens.LINK) {
      feeTokenAddress = sourceConfig.feeTokens.LINK;
    } else {
      feeTokenAddress = ethers.constants.AddressZero;
    }

    return {
      receiver: ethers.utils.defaultAbiCoder.encode(["address"], [recipient]),
      data: "0x", // Empty data for simple token transfer
      tokenAmounts: [
        {
          token: sourceConfig.usdc.tokenAddress,
          amount: amountWei.toString(),
        },
      ],
      feeToken: feeTokenAddress,
      extraArgs: this.encodeExtraArgs({ gasLimit: 200000 }),
    };
  }

  /**
   * Encode extra arguments for CCIP message
   * @param {Object} args - Extra arguments
   * @returns {string} Encoded extra args
   */
  encodeExtraArgs(args) {
    // Simple encoding for gas limit
    // In production, use proper CCIP encoding
    return ethers.utils.defaultAbiCoder.encode(["uint256"], [args.gasLimit]);
  }

  /**
   * Build CCIP transaction data for wallet execution
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @param {string} amount - USDC amount
   * @param {string} recipient - Recipient address
   * @param {string} feeToken - Fee token preference
   * @returns {Promise<Object>} Transaction data
   */
  async buildCCIPTransaction(
    sourceChain,
    destinationChain,
    amount,
    recipient,
    feeToken = "native"
  ) {
    try {
      console.log("🔧 Building CCIP transaction:", {
        sourceChain,
        destinationChain,
        amount,
        recipient,
        feeToken,
      });

      const sourceConfig = this.getNetworkConfig(sourceChain);
      const destConfig = this.getNetworkConfig(destinationChain);

      if (!sourceConfig || !destConfig) {
        throw new Error("Network configuration not found");
      }

      console.log("✅ Network configs loaded:", {
        sourceConfig: sourceConfig.chainName,
        destConfig: destConfig.chainName,
      });

      // Build CCIP message
      const message = this.buildCCIPMessage(
        recipient,
        amount,
        sourceConfig,
        destConfig,
        feeToken
      );

      console.log("✅ CCIP message built:", message);

      // Estimate fees
      const feeEstimate = await this.estimateCCIPFees(
        sourceChain,
        destinationChain,
        amount,
        recipient,
        feeToken
      );

      console.log("✅ Fee estimate:", feeEstimate);

      if (!feeEstimate.success) {
        throw new Error(`Fee estimation failed: ${feeEstimate.error}`);
      }

      // Encode transaction data
      const routerInterface = new ethers.utils.Interface(this.routerABI);
      const txData = routerInterface.encodeFunctionData("ccipSend", [
        destConfig.chainSelector,
        message,
      ]);

      console.log("✅ Transaction data encoded");

      return {
        success: true,
        to: sourceConfig.router,
        data: txData,
        value: feeToken === "native" ? feeEstimate.estimatedFee : "0",
        chainId: sourceConfig.chainId,
        gasLimit: "300000",
        gasPrice: null, // Let wallet estimate
        estimatedFee: feeEstimate.estimatedFee,
        feeToken: feeToken,
        sourceChain: sourceConfig.chainName,
        destinationChain: destConfig.chainName,
        amount: amount,
        recipient: recipient,
      };
    } catch (error) {
      console.error("❌ Failed to build CCIP transaction:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get estimated fee for a specific route (placeholder implementation)
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @returns {string} Estimated fee in wei
   */
  getEstimatedFeeForRoute(sourceChain, destinationChain) {
    // Placeholder fee estimation based on route complexity
    const sourceConfig = this.getNetworkConfig(sourceChain);
    const destConfig = this.getNetworkConfig(destinationChain);

    // Base fees by network type
    const baseFees = {
      "EVM->EVM": "0.002", // 0.002 ETH
      "EVM->Solana": "0.003", // 0.003 ETH
      "Solana->EVM": "0.002", // 0.002 ETH
    };

    let routeType;
    if (sourceConfig.type === "EVM" && destConfig.type === "EVM") {
      routeType = "EVM->EVM";
    } else if (sourceConfig.type === "EVM" && destConfig.type === "Solana") {
      routeType = "EVM->Solana";
    } else if (sourceConfig.type === "Solana" && destConfig.type === "EVM") {
      routeType = "Solana->EVM";
    } else {
      routeType = "EVM->EVM"; // fallback
    }

    return ethers.utils.parseEther(baseFees[routeType]).toString();
  }

  /**
   * Get all supported networks for UI display
   * @returns {Array} Array of network configurations
   */
  getAllSupportedNetworks() {
    const networks = [];
    this.networkConfigs.forEach((config) => {
      networks.push({
        chainId: config.chainId,
        chainName: config.chainName,
        currencySymbol: config.currencySymbol,
        type: config.type,
        rpcUrl: config.rpcUrl,
      });
    });
    return networks.sort((a, b) => {
      // Sort EVM networks first, then Solana
      if (a.type === "EVM" && b.type === "Solana") return -1;
      if (a.type === "Solana" && b.type === "EVM") return 1;
      return a.chainName.localeCompare(b.chainName);
    });
  }

  /**
   * Validate cross-chain transfer parameters
   * @param {Object} params - Transfer parameters
   * @returns {Object} Validation result
   */
  validateCrossChainTransfer(params) {
    const { sourceChain, destinationChain, amount, recipient } = params;

    // Check if networks are supported
    const sourceConfig = this.getNetworkConfig(sourceChain);
    const destConfig = this.getNetworkConfig(destinationChain);

    if (!sourceConfig) {
      return { valid: false, error: "Source network not supported" };
    }

    if (!destConfig) {
      return { valid: false, error: "Destination network not supported" };
    }

    // Check if route is supported
    if (!this.isRouteSupported(sourceChain, destinationChain)) {
      return {
        valid: false,
        error: `Cross-chain route ${sourceConfig.chainName} → ${destConfig.chainName} not supported`,
      };
    }

    // Validate amount
    if (!amount || parseFloat(amount) <= 0) {
      return { valid: false, error: "Invalid amount" };
    }

    // Validate recipient address
    if (!recipient || recipient.length < 10) {
      return { valid: false, error: "Invalid recipient address" };
    }

    return {
      valid: true,
      sourceConfig,
      destConfig,
      message: `Cross-chain transfer ${sourceConfig.chainName} → ${destConfig.chainName}`,
    };
  }
}

// Create and export an instance of the service
const ccipConfigService = new CCIPConfigService();
export default ccipConfigService;
