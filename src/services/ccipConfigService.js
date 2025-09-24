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

      // FIXED: Get REAL fee estimate from CCIP Router instead of hardcoded values
      const estimatedFee = await this.getRealCCIPFeeEstimate(
        sourceChain,
        destinationChain,
        message,
        sourceConfig
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
        gasLimit: "300000", // FIXED: Standardized gas limit
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

    // FIXED: Use native ETH for CCIP fees (standard practice) with reasonable amounts
    // Fee token address resolution
    let feeTokenAddress;
    if (feeToken === "native") {
      // Use native ETH for fees (standard CCIP practice)
      feeTokenAddress = ethers.constants.AddressZero;
      console.log("💰 Using native ETH for CCIP fees (standard practice)");
    } else if (
      feeToken === "LINK" &&
      sourceConfig.feeTokens &&
      sourceConfig.feeTokens.LINK
    ) {
      feeTokenAddress = sourceConfig.feeTokens.LINK;
      console.log("💰 Using LINK token for CCIP fees:", feeTokenAddress);
    } else {
      // Default to native ETH with warning
      console.warn(
        "⚠️ Fee token not found or invalid, defaulting to native ETH"
      );
      feeTokenAddress = ethers.constants.AddressZero;
    }

    console.log(`🔧 Fee Token Resolution:`, {
      requestedFeeToken: feeToken,
      resolvedAddress: feeTokenAddress,
      isNative: feeTokenAddress === ethers.constants.AddressZero,
      availableTokens: Object.keys(sourceConfig.feeTokens || {}),
    });

    console.log(`💰 CCIP Message Components:`, {
      recipient: recipient,
      recipientFormatted: ethers.utils.getAddress(recipient),
      usdcTokenAddress: sourceConfig.usdc.tokenAddress,
      amountUSDC: amount,
      amountWei: amountWei.toString(),
      feeTokenAddress: feeTokenAddress,
    });

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
      extraArgs: this.encodeExtraArgs({ gasLimit: 200000 }), // FIXED: Reduced gas limit for destination execution
    };
  }

  /**
   * Encode extra arguments for CCIP message
   * @param {Object} args - Extra arguments
   * @returns {string} Encoded extra args
   */
  encodeExtraArgs(args) {
    // FIXED: Proper CCIP extraArgs encoding with correct tag
    // According to Chainlink CCIP docs, extraArgs need the EVMExtraArgsV1 tag
    // Tag is derived from the hash of "CCIP EVMExtraArgsV1"
    const EXTRA_ARGS_V1_TAG = "0x97a657c9"; // 4-byte tag for EVMExtraArgsV1

    // Encode the gasLimit parameter
    const encodedArgs = ethers.utils.defaultAbiCoder.encode(
      ["uint256"],
      [args.gasLimit]
    );

    // Concatenate tag + encoded args
    const fullExtraArgs = EXTRA_ARGS_V1_TAG + encodedArgs.slice(2); // Remove 0x from encoded args

    console.log("🔧 ExtraArgs Encoding:", {
      gasLimit: args.gasLimit,
      tag: EXTRA_ARGS_V1_TAG,
      encodedArgs: encodedArgs,
      fullExtraArgs: fullExtraArgs,
      length: fullExtraArgs.length,
    });

    return fullExtraArgs;
  }

  /**
   * Simulate CCIP transaction to detect potential revert reasons
   * This function performs a dry-run of the ccipSend call to identify issues
   * before submitting the actual transaction.
   *
   * @param {string} routerAddress - CCIP Router contract address
   * @param {string} destinationChainSelector - Destination chain selector
   * @param {Object} message - CCIP message object
   * @param {string} valueWei - Transaction value in wei
   * @param {string} userAddress - User's wallet address
   * @returns {Promise<Object>} Simulation result with success/error info
   */
  async simulateCCIPTransaction(
    routerAddress,
    destinationChainSelector,
    message,
    valueWei,
    userAddress
  ) {
    try {
      console.log("🎬 SIMULATING CCIP Transaction before execution...");
      console.log("📋 Simulation Parameters:", {
        router: routerAddress,
        destinationSelector: destinationChainSelector,
        value: valueWei,
        from: userAddress,
        messageStructure: JSON.stringify(message, null, 2),
      });

      if (!window.ethereum) {
        return {
          success: false,
          error: "No MetaMask provider available for simulation",
        };
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const routerContract = new ethers.Contract(
        routerAddress,
        CCIP_ROUTER_ABI,
        provider
      );

      // Perform static call (simulation) to detect revert reasons
      try {
        console.log("🔍 Performing staticCall simulation...");

        // Pre-simulation validation checks
        console.log("🔍 Pre-simulation validation:");

        // Check if destination chain selector is supported
        try {
          const isSupported = await routerContract.isChainSupported(
            destinationChainSelector
          );
          console.log(`  - Destination chain supported: ${isSupported}`);
          if (!isSupported) {
            return {
              success: false,
              error: "Destination chain not supported by CCIP Router",
              revertReason: "Destination chain not supported",
              preValidationFailed: true,
            };
          }
        } catch (checkError) {
          console.warn(
            "  - Could not check chain support:",
            checkError.message
          );
        }

        // Check if we have enough ETH for fees
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const userBalance = await provider.getBalance(userAddress);
        const requiredValue = ethers.BigNumber.from(valueWei);
        console.log(
          `  - User ETH balance: ${ethers.utils.formatEther(userBalance)} ETH`
        );
        console.log(
          `  - Required value: ${ethers.utils.formatEther(requiredValue)} ETH`
        );
        console.log(
          `  - Sufficient balance: ${userBalance.gte(requiredValue)}`
        );

        if (userBalance.lt(requiredValue)) {
          return {
            success: false,
            error: "Insufficient ETH balance for transaction value + gas",
            revertReason: "Insufficient ETH balance",
            preValidationFailed: true,
          };
        }

        const simulationResult = await routerContract.callStatic.ccipSend(
          destinationChainSelector,
          message,
          {
            from: userAddress,
            value: valueWei,
            gasLimit: 300000, // High gas limit for simulation
          }
        );

        console.log("✅ SIMULATION SUCCESS - Transaction should work:", {
          simulationResult: simulationResult.toString(),
          messageId: simulationResult,
        });

        return {
          success: true,
          messageId: simulationResult.toString(),
          message: "Simulation successful - transaction should execute",
        };
      } catch (simulationError) {
        console.error("❌ SIMULATION FAILED - Transaction will revert:", {
          error: simulationError.message,
          code: simulationError.code,
          data: simulationError.data,
          reason: simulationError.reason,
          fullError: simulationError,
        });

        // Enhanced revert reason decoding
        let revertReason = "Unknown revert reason";
        let decodingAttempts = [];

        // Method 1: Check if error has a direct reason
        if (simulationError.reason) {
          revertReason = simulationError.reason;
          decodingAttempts.push("Direct reason property");
        }
        // Method 2: Try to extract from error message
        else if (simulationError.message) {
          // Look for common patterns in error messages
          const patterns = [
            /revert (.+)/i,
            /execution reverted: (.+)/i,
            /VM execution error: (.+)/i,
            /reverted with reason string '(.+)'/i,
          ];

          for (const pattern of patterns) {
            const match = simulationError.message.match(pattern);
            if (match && match[1]) {
              revertReason = match[1].trim();
              decodingAttempts.push(`Message pattern: ${pattern.source}`);
              break;
            }
          }
        }

        // Method 3: Try to decode from error data
        if (simulationError.data && simulationError.data.length > 10) {
          try {
            const errorData = simulationError.data;
            decodingAttempts.push(`Raw data: ${errorData}`);

            if (errorData.startsWith("0x08c379a0")) {
              // Standard revert with reason string
              const reason = ethers.utils.defaultAbiCoder.decode(
                ["string"],
                "0x" + errorData.slice(10)
              )[0];
              revertReason = reason;
              decodingAttempts.push("ABI decoded revert string");
            } else if (errorData.startsWith("0x4e487b71")) {
              // Panic error
              const panicCode = ethers.utils.defaultAbiCoder.decode(
                ["uint256"],
                "0x" + errorData.slice(10)
              )[0];
              revertReason = `Panic error: ${panicCode.toString()}`;
              decodingAttempts.push("Panic code decoded");
            }
          } catch (decodeError) {
            console.warn("Could not decode revert reason:", decodeError);
            decodingAttempts.push(`Decode failed: ${decodeError.message}`);
          }
        }

        // Method 4: Check for specific CCIP errors
        const ccipErrorPatterns = {
          "insufficient fee": "CCIP fee too low",
          "router not approved": "Router not approved for token transfer",
          "destination chain not supported": "Destination chain not supported",
          "token not supported": "Token not supported on this route",
          allowance: "Insufficient token allowance",
          balance: "Insufficient token balance",
        };

        for (const [pattern, description] of Object.entries(
          ccipErrorPatterns
        )) {
          if (simulationError.message?.toLowerCase().includes(pattern)) {
            revertReason = description;
            decodingAttempts.push(`CCIP pattern match: ${pattern}`);
            break;
          }
        }

        console.log("🔍 Revert reason decoding attempts:", decodingAttempts);
        console.log("🎯 Final decoded revert reason:", revertReason);

        return {
          success: false,
          error: simulationError.message,
          revertReason,
          errorCode: simulationError.code,
          rawError: simulationError,
          decodingAttempts,
        };
      }
    } catch (error) {
      console.error("🚨 Simulation setup failed:", error);
      return {
        success: false,
        error: "Simulation setup failed: " + error.message,
      };
    }
  }

  /**
   * Build CCIP transaction data for wallet execution
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @param {string} amount - USDC amount
   * @param {string} recipient - Recipient address
   * @param {string} feeToken - Fee token preference
   * @param {boolean} skipSimulation - Skip pre-execution simulation (default: false)
   * @returns {Promise<Object>} Transaction data
   */
  async buildCCIPTransaction(
    sourceChain,
    destinationChain,
    amount,
    recipient,
    feeToken = "native",
    skipSimulation = false
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

      // 🔍 ULTRA-DETAILED CCIP MESSAGE VALIDATION AND LOGGING
      console.log("🔍==== ULTRA-DETAILED CCIP MESSAGE ANALYSIS ====");
      console.log(
        "📋 Final ccipMessage sent to router:",
        JSON.stringify(message, null, 2)
      );

      // Individual component verification
      console.log("🔍 RECEIVER VERIFICATION:");
      console.log("  - message.receiver:", message.receiver);
      console.log("  - receiver type:", typeof message.receiver);
      console.log("  - receiver length:", message.receiver.length);
      console.log("  - is valid hex:", message.receiver.startsWith("0x"));
      console.log(
        "  - decoded address:",
        ethers.utils.defaultAbiCoder.decode(["address"], message.receiver)[0]
      );
      console.log("  - expected recipient:", recipient);
      console.log(
        "  - addresses match:",
        ethers.utils.defaultAbiCoder
          .decode(["address"], message.receiver)[0]
          .toLowerCase() === recipient.toLowerCase()
      );

      console.log("🔍 DATA VERIFICATION:");
      console.log("  - message.data:", message.data);
      console.log("  - data type:", typeof message.data);
      console.log("  - data length:", message.data.length);
      console.log("  - is empty (0x):", message.data === "0x");
      console.log(
        "  - explanation: Empty data for simple token transfer to EOA"
      );

      console.log("🔍 TOKEN AMOUNTS VERIFICATION:");
      console.log(
        "  - message.tokenAmounts:",
        JSON.stringify(message.tokenAmounts, null, 2)
      );
      console.log("  - tokenAmounts length:", message.tokenAmounts.length);
      if (message.tokenAmounts.length > 0) {
        const tokenAmount = message.tokenAmounts[0];
        console.log("  - token address:", tokenAmount.token);
        console.log("  - token type:", typeof tokenAmount.token);
        console.log(
          "  - expected USDC (Base Sepolia):",
          sourceConfig.usdc.tokenAddress
        );
        console.log(
          "  - token addresses match:",
          tokenAmount.token.toLowerCase() ===
            sourceConfig.usdc.tokenAddress.toLowerCase()
        );
        console.log("  - amount:", tokenAmount.amount);
        console.log("  - amount type:", typeof tokenAmount.amount);
        console.log(
          "  - amount in USDC:",
          ethers.utils.formatUnits(tokenAmount.amount, 6)
        );
        console.log("  - expected amount:", amount);

        // CRITICAL: Verify amount is valid for CCIP
        try {
          const amountBN = ethers.BigNumber.from(tokenAmount.amount);
          console.log("  - amount as BigNumber:", amountBN.toString());
          console.log("  - amount > 0:", amountBN.gt(0));
          console.log(
            "  - amount reasonable (<1000 USDC):",
            amountBN.lt(ethers.utils.parseUnits("1000", 6))
          );
        } catch (amountError) {
          console.log("  - amount BigNumber error:", amountError.message);
        }
      }

      console.log("🔍 FEE TOKEN VERIFICATION:");
      console.log("  - message.feeToken:", message.feeToken);
      console.log("  - feeToken type:", typeof message.feeToken);
      console.log(
        "  - is native ETH (zero address):",
        message.feeToken === "0x0000000000000000000000000000000000000000"
      );
      console.log("  - expected feeToken param:", feeToken);

      console.log("🔍 EXTRA ARGS VERIFICATION:");
      console.log("  - message.extraArgs:", message.extraArgs);
      console.log("  - extraArgs type:", typeof message.extraArgs);
      console.log("  - extraArgs length:", message.extraArgs.length);
      console.log(
        "  - has correct tag (0x97a657c9):",
        message.extraArgs.startsWith("0x97a657c9")
      );

      try {
        // Decode the extra args to verify gas limit
        const tagLength = 10; // "0x97a657c9" is 10 characters
        const encodedGasLimit = "0x" + message.extraArgs.slice(tagLength);
        const decodedGasLimit = ethers.utils.defaultAbiCoder.decode(
          ["uint256"],
          encodedGasLimit
        )[0];
        console.log("  - decoded gasLimit:", decodedGasLimit.toString());
        console.log(
          "  - gasLimit reasonable (>50000):",
          decodedGasLimit.gt(50000)
        );
      } catch (decodeError) {
        console.log("  - extraArgs decode error:", decodeError.message);
      }

      console.log("🔍 DESTINATION CHAIN VERIFICATION:");
      console.log("  - destination selector:", destConfig.chainSelector);
      console.log(
        "  - destination selector type:",
        typeof destConfig.chainSelector
      );
      console.log("  - destination chain name:", destConfig.chainName);
      console.log("  - destination chain ID:", destConfig.chainId);

      // CRITICAL: Verify chain selector format and value
      try {
        if (typeof destConfig.chainSelector === "string") {
          const selectorBN = ethers.BigNumber.from(destConfig.chainSelector);
          console.log("  - selector as BigNumber:", selectorBN.toString());
          console.log("  - selector > 0:", selectorBN.gt(0));
          console.log("  - selector hex:", selectorBN.toHexString());
        } else {
          console.log(
            "  - selector already numeric:",
            destConfig.chainSelector
          );
        }

        // Verify this is a valid CCIP chain selector for Ethereum Sepolia
        const expectedEthSepoliaSelector = "16015286601757825753"; // Ethereum Sepolia
        console.log(
          "  - expected Eth Sepolia selector:",
          expectedEthSepoliaSelector
        );
        console.log(
          "  - selectors match:",
          destConfig.chainSelector.toString() === expectedEthSepoliaSelector
        );
      } catch (selectorError) {
        console.log("  - chain selector error:", selectorError.message);
      }

      console.log("🔍 COMPLETE MESSAGE STRUCTURE CHECK:");
      const requiredFields = [
        "receiver",
        "data",
        "tokenAmounts",
        "feeToken",
        "extraArgs",
      ];
      requiredFields.forEach((field) => {
        console.log(`  - ${field} present:`, field in message);
        console.log(
          `  - ${field} not null/undefined:`,
          message[field] !== null && message[field] !== undefined
        );
      });

      console.log("🔍==== END CCIP MESSAGE ANALYSIS ====");

      // Get provider for fee estimation (using source chain's RPC URL)
      // Fix RPC URL format - add https:// if missing
      let rpcUrl = sourceConfig.rpcUrl;
      if (!rpcUrl.startsWith("http://") && !rpcUrl.startsWith("https://")) {
        rpcUrl = "https://" + rpcUrl;
      }
      console.log("🔧 RPC URL for provider:", rpcUrl);

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);

      // Estimate fees using the updated estimateCCIPFees function
      const feeEstimate = await this.estimateCCIPFees(
        sourceChain,
        destinationChain,
        amount,
        recipient,
        feeToken,
        provider // Pass the provider for on-chain fee estimation
      );

      console.log("✅ Fee estimate:", feeEstimate);

      if (!feeEstimate.success) {
        throw new Error(`Fee estimation failed: ${feeEstimate.error}`);
      }

      // Encode transaction data for ccipSend
      const routerInterface = new ethers.utils.Interface(this.routerABI);

      // 🚨 FINAL PRE-ENCODING VERIFICATION
      console.log("🚨==== FINAL CCIP ENCODING VERIFICATION ====");
      console.log("📋 About to encode ccipSend with parameters:");
      console.log("  - destinationChainSelector:", destConfig.chainSelector);
      console.log("  - message (final):", JSON.stringify(message, null, 2));
      console.log("🚨============================================");

      const txData = routerInterface.encodeFunctionData("ccipSend", [
        destConfig.chainSelector,
        message,
      ]);

      console.log("✅ Transaction data encoded");

      // Set transaction value to the estimated fee (for native fee payments)
      const transactionValue = feeEstimate.estimatedFee; // This is already buffered

      console.log(`🛡️ CCIP Fee Payment (Native ETH with Buffer):`, {
        transferType: "USDC (ERC-20)",
        originalFeeETH: "Retrieved from router contract",
        bufferPercent: "20%",
        bufferedFeeETH: ethers.utils.formatEther(transactionValue),
        finalFeeETH: ethers.utils.formatEther(transactionValue),
        source: "Dynamic router query with 20% buffer",
        note: "Transaction value = CCIP fee only (USDC transfer uses ERC-20)",
      });

      console.log(`⛽ GAS & FEE TOKEN ANALYSIS:`, {
        feeToken: feeToken,
        gasLimit: "300000",
        gasPrice: "wallet-estimated",
        transactionValueETH: ethers.utils.formatEther(transactionValue),
        transferAmount: `${amount} USDC`,
        feeTokenUsage:
          feeToken === "native" ? "Using ETH for fees" : "Using LINK for fees",
        gasEstimateUSD: `~$${(300000 * 20 * 0.000000001 * 2500).toFixed(2)}`, // 300k gas * 20 gwei * ETH price
      });

      // CRITICAL: Final verification of message consistency
      const finalMessage = this.buildCCIPMessage(
        recipient,
        amount,
        sourceConfig,
        destConfig,
        feeToken
      );
      console.log(
        "🔐 Final CCIP message for transaction:",
        JSON.stringify(finalMessage, null, 2)
      );
      console.log("🎯 TRANSACTION VALUE VERIFICATION:", {
        calculatedFeeWei: feeEstimate.estimatedFee,
        bufferedValueWei: transactionValue,
        finalValueETH: ethers.utils.formatEther(transactionValue),
        messageConsistency:
          JSON.stringify(finalMessage) === JSON.stringify(feeEstimate.message)
            ? "✅ CONSISTENT"
            : "❌ MISMATCH",
      });

      // 🎬 PRE-EXECUTION SIMULATION TO DETECT REVERT REASONS (OPTIONAL)
      if (!skipSimulation) {
        console.log(
          "🎬 Running pre-execution simulation to detect potential issues..."
        );
        try {
          // Get user address for simulation
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const userAddress = await signer.getAddress();

          const simulationResult = await this.simulateCCIPTransaction(
            sourceConfig.router,
            destConfig.chainSelector,
            finalMessage,
            transactionValue,
            userAddress
          );

          if (!simulationResult.success) {
            console.error("🚨 SIMULATION DETECTED TRANSACTION WILL FAIL:", {
              revertReason: simulationResult.revertReason,
              errorMessage: simulationResult.error,
              errorCode: simulationResult.errorCode,
            });

            // Return error with detailed simulation results
            return {
              success: false,
              error: `Transaction simulation failed: ${
                simulationResult.revertReason || simulationResult.error
              }`,
              simulationError: simulationResult,
              to: sourceConfig.router,
              data: txData,
              value: transactionValue,
              valueETH: ethers.utils.formatEther(transactionValue),
              chainId: sourceConfig.chainId,
              gasLimit: "300000",
              gasPrice: null,
              estimatedFee: feeEstimate.estimatedFee,
              estimatedFeeETH: ethers.utils.formatEther(
                feeEstimate.estimatedFee
              ),
              feeToken: feeToken,
              sourceChain: sourceConfig.chainName,
              destinationChain: destConfig.chainName,
              amount: amount,
              recipient: recipient,
              message: feeEstimate.message,
            };
          } else {
            console.log(
              "✅ SIMULATION SUCCESS - Transaction should execute properly:",
              {
                expectedMessageId: simulationResult.messageId,
                simulationMessage: simulationResult.message,
              }
            );
          }
        } catch (simulationSetupError) {
          console.warn(
            "⚠️ Could not run simulation (proceeding anyway):",
            simulationSetupError.message
          );
        }
      } else {
        console.log(
          "🚀 Skipping simulation - proceeding directly to transaction build"
        );
      }

      return {
        success: true,
        to: sourceConfig.router,
        data: txData,
        value: transactionValue, // EMERGENCY: Capped transaction value
        valueETH: ethers.utils.formatEther(transactionValue), // Formatted value for display
        chainId: sourceConfig.chainId,
        gasLimit: "300000", // FIXED: Standardized gas limit
        gasPrice: null, // Let wallet estimate
        estimatedFee: feeEstimate.estimatedFee,
        estimatedFeeETH: ethers.utils.formatEther(feeEstimate.estimatedFee), // Formatted fee for display
        feeToken: feeToken, // Keep original fee token preference
        sourceChain: sourceConfig.chainName,
        destinationChain: destConfig.chainName,
        amount: amount,
        recipient: recipient,
        message: feeEstimate.message, // Include the CCIP message for debugging
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
   * Get REAL fee estimate from CCIP Router contract
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @param {Object} message - CCIP message object
   * @param {Object} sourceConfig - Source network configuration
   * @returns {Promise<string>} Real fee estimate in wei
   */
  async getRealCCIPFeeEstimate(
    sourceChain,
    destinationChain,
    message,
    sourceConfig
  ) {
    try {
      console.log("🔍 Getting REAL CCIP fee estimate from router...");

      // Check if we can call the router
      if (!window.ethereum) {
        console.warn(
          "⚠️ No MetaMask available, falling back to hardcoded estimate"
        );
        return this.getEstimatedFeeForRoute(sourceChain, destinationChain);
      }

      // Create provider and router contract instance
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const routerContract = new ethers.Contract(
        sourceConfig.router,
        CCIP_ROUTER_ABI,
        provider
      );

      // Get destination chain selector
      const destConfig = this.getNetworkConfig(destinationChain);
      const destinationChainSelector = destConfig.chainSelector;

      // CRITICAL: Use the EXACT same message object for fee estimation
      // to ensure 100% consistency with the actual transaction
      console.log("🔍 Using EXACT message for getFee (ensuring consistency):", {
        router: sourceConfig.router,
        destinationSelector: destinationChainSelector,
        exactMessage: message,
      });

      // Call the getFee function with the EXACT same message
      const feeWei = await routerContract.getFee(
        destinationChainSelector,
        message
      );

      console.log("✅ REAL CCIP Fee Retrieved:", {
        feeWei: feeWei.toString(),
        feeETH: ethers.utils.formatEther(feeWei),
        source: "CCIP Router Contract",
      });

      // CRITICAL: Log the exact message used for fee estimation
      console.log(
        "🔐 Message used for getFee():",
        JSON.stringify(message, null, 2)
      );

      return feeWei.toString();
    } catch (error) {
      console.error("❌ Failed to get real CCIP fee, using fallback:", error);

      // Fallback to hardcoded estimate if router call fails
      const fallbackFee = this.getEstimatedFeeForRoute(
        sourceChain,
        destinationChain
      );
      console.log("🔄 Using fallback fee estimate:", {
        fallbackFeeWei: fallbackFee,
        fallbackFeeETH: ethers.utils.formatEther(fallbackFee),
        reason: error.message,
      });

      return fallbackFee;
    }
  }

  // Helper to get an ethers.js Contract instance for the CCIP Router
  getRouterContract(routerAddress, provider) {
    return new ethers.Contract(routerAddress, this.routerABI, provider);
  }

  /**
   * Estimate CCIP transfer fees by calling the router contract
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @param {string} amount - USDC amount in human readable format
   * @param {string} recipient - Recipient address on destination chain
   * @param {string} feeToken - Fee token preference ("native", "LINK")
   * @param {Object} provider - Ethers.js provider for the source chain
   * @returns {Promise<Object>} Fee estimation result
   */
  async estimateCCIPFees(
    sourceChain,
    destinationChain,
    amount,
    recipient,
    feeToken = "native",
    provider
  ) {
    try {
      if (!this.isCrossChainTransfer(sourceChain, destinationChain)) {
        throw new Error("Not a cross-chain transfer");
      }

      if (!this.isRouteSupported(sourceChain, destinationChain)) {
        throw new Error("Cross-chain route not supported");
      }

      if (!provider) {
        throw new Error("Ethers.js provider is required for fee estimation");
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

      // Get router contract instance
      const routerContract = this.getRouterContract(
        sourceConfig.router,
        provider
      );

      // Call getFee on the router contract
      console.log("Calling router.getFee() with:", {
        destinationChainSelector: destConfig.chainSelector,
        message: message,
      });

      const estimatedFee = await routerContract.getFee(
        destConfig.chainSelector,
        message
      );

      // Add a 20% buffer to the estimated fee for robustness
      const bufferedFee =
        BigInt(estimatedFee) +
        (BigInt(estimatedFee) * BigInt(20)) / BigInt(100);

      console.log(`💰 Actual CCIP Fee Calculation:`, {
        rawEstimatedFee: estimatedFee.toString(),
        bufferedFee: bufferedFee.toString(),
        rawEstimatedFeeETH: ethers.utils.formatEther(estimatedFee),
        bufferedFeeETH: ethers.utils.formatEther(bufferedFee),
        feeToken: feeToken,
      });

      return {
        success: true,
        sourceChain: sourceConfig.chainName,
        destinationChain: destConfig.chainName,
        amount: amount,
        estimatedFee: bufferedFee.toString(), // Return buffered fee
        feeToken: feeToken,
        message: message,
        routerAddress: sourceConfig.router,
        gasLimit: "300000", // Standardized gas limit
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
   * @deprecated - Replaced by estimateCCIPFees with dynamic router queries
   * Get estimated fee for a specific route (placeholder implementation)
   * @param {string|number} sourceChain - Source chain ID
   * @param {string|number} destinationChain - Destination chain ID
   * @returns {string} Estimated fee in wei
   */
  getEstimatedFeeForRoute_OLD(sourceChain, destinationChain) {
    // FIXED: Much more reasonable CCIP fee estimation for testnets
    const sourceConfig = this.getNetworkConfig(sourceChain);
    const destConfig = this.getNetworkConfig(destinationChain);

    // FIXED: More realistic CCIP fee estimation for testnets (increased from emergency levels)
    const baseFees = {
      "EVM->EVM": "0.0005", // FIXED: 0.0005 ETH (~$1.25) - more realistic for CCIP
      "EVM->Solana": "0.001", // FIXED: 0.001 ETH (~$2.50) - cross-ecosystem premium
      "Solana->EVM": "0.0005", // FIXED: 0.0005 ETH (~$1.25)
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

    const feeInEth = baseFees[routeType];
    const feeInWei = ethers.utils.parseEther(feeInEth).toString();

    // FIXED: Increased emergency cap to accommodate realistic fees + buffer
    const maxFeeWei = ethers.utils.parseEther("0.005").toString(); // 0.005 ETH (~$12.50) max
    const finalFeeWei =
      BigInt(feeInWei) > BigInt(maxFeeWei) ? maxFeeWei : feeInWei;

    console.log(`💰 EMERGENCY Fee Calculation:`, {
      route: `${sourceChain} -> ${destinationChain}`,
      routeType: routeType,
      requestedFeeETH: feeInEth,
      calculatedWei: feeInWei,
      cappedWei: finalFeeWei,
      finalETH: ethers.utils.formatEther(finalFeeWei),
      finalUSD: `$${(
        parseFloat(ethers.utils.formatEther(finalFeeWei)) * 2500
      ).toFixed(2)}`,
      isCapped: BigInt(feeInWei) > BigInt(maxFeeWei),
    });

    return finalFeeWei;
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

  /**
   * Check and handle ERC-20 allowance for CCIP token transfers
   * @param {string|number} sourceChain - Source chain ID
   * @param {string} tokenAmount - Token amount in wei (e.g., "4000000" for 4 USDC)
   * @param {string} userAddress - User's wallet address
   * @returns {Object} Allowance status and required actions
   */
  async checkAndHandleAllowance(sourceChain, tokenAmount, userAddress) {
    try {
      console.log("🔍 Checking ERC-20 allowance for CCIP transfer...", {
        sourceChain,
        tokenAmount,
        userAddress,
      });

      if (!window.ethereum) {
        throw new Error("MetaMask not available for allowance check");
      }

      const sourceConfig = this.getNetworkConfig(sourceChain);
      if (!sourceConfig || !sourceConfig.usdc) {
        throw new Error(
          `USDC configuration not found for chain ${sourceChain}`
        );
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // ERC-20 contract ABI for allowance and approve functions
      const ERC20_ABI = [
        "function allowance(address owner, address spender) external view returns (uint256)",
        "function approve(address spender, uint256 amount) external returns (bool)",
        "function balanceOf(address account) external view returns (uint256)",
      ];

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(
        sourceConfig.usdc.tokenAddress,
        ERC20_ABI,
        signer
      );

      // Check current allowance
      const currentAllowance = await usdcContract.allowance(
        userAddress,
        sourceConfig.router
      );

      console.log("💰 ERC-20 Allowance Check:", {
        usdcContract: sourceConfig.usdc.tokenAddress,
        ccipRouter: sourceConfig.router,
        tokenAmountWei: tokenAmount,
        currentAllowanceWei: currentAllowance.toString(),
        tokenAmountUSDC: ethers.utils.formatUnits(tokenAmount, 6),
        currentAllowanceUSDC: ethers.utils.formatUnits(currentAllowance, 6),
        isAllowanceSufficient: currentAllowance.gte(tokenAmount),
      });

      const isAllowanceSufficient = currentAllowance.gte(tokenAmount);

      return {
        success: true,
        isAllowanceSufficient,
        currentAllowance: currentAllowance.toString(),
        currentAllowanceUSDC: ethers.utils.formatUnits(currentAllowance, 6),
        requiredAmount: tokenAmount,
        requiredAmountUSDC: ethers.utils.formatUnits(tokenAmount, 6),
        usdcContractAddress: sourceConfig.usdc.tokenAddress,
        ccipRouterAddress: sourceConfig.router,
        needsApproval: !isAllowanceSufficient,
      };
    } catch (error) {
      console.error("❌ Allowance check failed:", error);
      return {
        success: false,
        error: error.message,
        needsApproval: true, // Assume approval needed if check fails
      };
    }
  }

  /**
   * Request approval for CCIP Router to spend USDC tokens
   * @param {string|number} sourceChain - Source chain ID
   * @param {string} tokenAmount - Token amount in wei to approve
   * @param {string} userAddress - User's wallet address
   * @returns {Object} Approval transaction result
   */
  async requestUSDCApproval(sourceChain, tokenAmount, userAddress) {
    try {
      console.log("📝 Requesting USDC approval for CCIP Router...", {
        sourceChain,
        tokenAmount,
        userAddress,
      });

      if (!window.ethereum) {
        throw new Error("MetaMask not available for approval");
      }

      const sourceConfig = this.getNetworkConfig(sourceChain);
      if (!sourceConfig || !sourceConfig.usdc) {
        throw new Error(
          `USDC configuration not found for chain ${sourceChain}`
        );
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      // CRITICAL: Verify signer and provider connection
      try {
        const network = await provider.getNetwork();
        const signerAddress = await signer.getAddress();

        console.log("🔍 Signer verification for approval:", {
          provider: !!provider,
          signer: !!signer,
          network: network,
          signerAddress: signerAddress,
          isConnected: provider.connection ? !!provider.connection : "unknown",
          expectedChain: sourceChain,
          actualChainId: network.chainId,
        });

        // Verify we're on the correct network
        if (network.chainId !== parseInt(sourceChain)) {
          console.warn(
            `⚠️ Network mismatch: Expected ${sourceChain}, got ${network.chainId}`
          );
          // Continue anyway - network switching should happen in UI
        }

        // Double-check the signer address matches the expected user address
        if (signerAddress.toLowerCase() !== userAddress.toLowerCase()) {
          throw new Error(
            `Signer address mismatch: expected ${userAddress}, got ${signerAddress}`
          );
        }

        console.log("✅ Signer verification passed - proceeding with approval");
      } catch (signerError) {
        console.error("❌ Signer verification failed:", signerError);
        throw new Error(`Signer connection issue: ${signerError.message}`);
      }

      // ERC-20 approve ABI
      const ERC20_ABI = [
        "function approve(address spender, uint256 amount) external returns (bool)",
      ];

      // Create USDC contract instance
      const usdcContract = new ethers.Contract(
        sourceConfig.usdc.tokenAddress,
        ERC20_ABI,
        signer
      );

      console.log("🔓 Requesting USDC approval transaction:", {
        usdcContract: sourceConfig.usdc.tokenAddress,
        spender: sourceConfig.router,
        amount: tokenAmount,
        amountUSDC: ethers.utils.formatUnits(tokenAmount, 6),
      });

      // Request approval transaction
      const approveTx = await usdcContract.approve(
        sourceConfig.router,
        tokenAmount
      );

      console.log("⏳ Approval transaction sent:", {
        hash: approveTx.hash,
        waiting: "for confirmation...",
      });

      // Wait for transaction confirmation
      const receipt = await approveTx.wait();

      console.log("✅ USDC Approval successful:", {
        hash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      });

      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
      };
    } catch (error) {
      console.error("❌ USDC approval failed:", error);
      return {
        success: false,
        error: error.message,
        userRejected:
          error.code === 4001 || error.message.includes("User denied"),
      };
    }
  }
}

// Create and export an instance of the service
const ccipConfigService = new CCIPConfigService();
export default ccipConfigService;
