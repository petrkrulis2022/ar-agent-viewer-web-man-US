// Dynamic QR Service for AR Viewer - Custom Stablecoins Enhanced
// Handles EVM network autodetection and QR generation
// Supports USDh and 6 additional custom stablecoins (all 6-decimal ERC-20)

import QRCode from "qrcode";
import { ethers } from "ethers";
import ccipConfigService from "./ccipConfigService.js";
import ccipConfigConsolidated from "../config/ccip-config-consolidated.json";
import customStablecoinService from "./customStablecoinService.js";

class DynamicQRService {
  constructor() {
    this.currentNetwork = null;

    // Initialize USDC token addresses and network configurations from consolidated config
    this.usdcTokenAddresses = {};
    this.supportedNetworks = {};

    this.initializeFromConsolidatedConfig();
  }

  /**
   * Initialize configurations from consolidated CCIP config
   * Dynamically loads USDC addresses and network configurations
   */
  initializeFromConsolidatedConfig() {
    console.log("🔄 Initializing DynamicQRService from consolidated config...");

    Object.entries(ccipConfigConsolidated.chains).forEach(
      ([chainName, config]) => {
        const chainId = config.chainId;

        // Build USDC token addresses map
        if (chainId === "devnet") {
          this.usdcTokenAddresses["solana-devnet"] = config.usdc.tokenAddress;
        } else {
          this.usdcTokenAddresses[chainId] = config.usdc.tokenAddress;
        }

        // Build supported networks configuration
        const networkConfig = {
          name: config.chainName,
          symbol: config.currencySymbol,
          type: chainId === "devnet" ? "SVM" : "EVM",
          rpc: config.rpcUrl.startsWith("http")
            ? config.rpcUrl
            : `https://${config.rpcUrl}`,
          chainSelector: config.chainSelector,
          router: config.router,
        };

        if (chainId === "devnet") {
          this.supportedNetworks["solana-devnet"] = networkConfig;
        } else {
          this.supportedNetworks[chainId] = networkConfig;
        }
      },
    );

    console.log("✅ DynamicQRService initialized with consolidated config:", {
      usdcAddresses: Object.keys(this.usdcTokenAddresses).length,
      networks: Object.keys(this.supportedNetworks).length,
    });

    // ✅ Hedera Testnet already in consolidated config with custom stablecoins
    console.log(
      "✅ Hedera Testnet (296) configured with USDh and custom stablecoins",
    );
  }

  // Network utility methods
  detectChainType(chainId) {
    if (chainId === "solana-devnet" || chainId === "devnet") {
      return "SVM"; // Solana Virtual Machine
    }
    return "EVM"; // Ethereum Virtual Machine
  }

  isEVMNetwork(chainId) {
    return this.detectChainType(chainId) === "EVM";
  }

  isSolanaNetwork(chainId) {
    return this.detectChainType(chainId) === "SVM";
  }

  getSupportedNetworks() {
    return this.supportedNetworks;
  }

  getNetworkInfo(chainId) {
    const networkInfo = this.supportedNetworks[chainId];
    if (networkInfo) {
      // Add USDC address to network info
      return {
        ...networkInfo,
        usdcAddress: this.usdcTokenAddresses[chainId],
      };
    }
    return null;
  }

  // 🔍 CROSS-CHAIN DETECTION METHODS (for debugging)
  async detectUserNetwork() {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        });
        return String(parseInt(chainId, 16));
      } catch (error) {
        console.warn("Could not detect user network:", error);
        return null;
      }
    }
    return null;
  }

  async getAgentNetwork(agentData) {
    // Check deployment_chain_id first (most authoritative)
    let chainId = String(
      agentData.deployment_chain_id ||
        agentData.chain_id ||
        agentData.network_id ||
        11155111,
    );

    // 🔧 CRITICAL FIX: Override chain ID if network name indicates Hedera but database has wrong value
    const networkName = agentData.deployment_network_name || agentData.network;
    if (networkName && networkName.toLowerCase().includes("hedera")) {
      console.log(
        "🔧 [getAgentNetwork] Hedera network detected from name - overriding chain ID to 296",
      );
      chainId = "296";
    }

    return chainId;
  }

  async detectCrossChainNeed(agentData, userChainId = null) {
    const agentChainId = await this.getAgentNetwork(agentData);
    const currentUserChain = userChainId || (await this.detectUserNetwork());

    return {
      userChain: currentUserChain,
      agentChain: agentChainId,
      needsCrossChain: currentUserChain && currentUserChain !== agentChainId,
      supportedRoute:
        currentUserChain && agentChainId
          ? ccipConfigService.isRouteSupported(currentUserChain, agentChainId)
          : false,
    };
  }

  // 📱 METAMASK-OPTIMIZED QR GENERATION
  async generateMetaMaskCompatibleQR(
    agentData,
    sourceChainId,
    destChainId,
    amount,
    feeToken = "native",
  ) {
    try {
      console.log("📱 Generating MetaMask-optimized cross-chain QR");

      // Get CCIP configuration
      const sourceConfig = ccipConfigService.getNetworkConfig(sourceChainId);
      const destConfig = ccipConfigService.getNetworkConfig(destChainId);

      if (!sourceConfig || !destConfig) {
        throw new Error("Network configuration not found");
      }

      // Build simplified CCIP transaction with minimal data
      const ccipTx = await ccipConfigService.buildCCIPTransaction(
        sourceChainId,
        destChainId,
        amount,
        agentData.agent_wallet_address || agentData.payment_recipient_address,
        feeToken,
      );

      if (!ccipTx.success) {
        throw new Error(`CCIP transaction build failed: ${ccipTx.error}`);
      }

      // Create MetaMask-friendly URI for USDC CCIP transfer
      const routerAddress = sourceConfig.router;

      // CRITICAL FIX: Use the calculated CCIP fee value from the transaction
      // WRONG: hardcoding "0" prevents fee payment → InsufficientFeeTokenAmount error
      // RIGHT: Use ccipTx.value which contains the calculated fee amount
      const transferValue = ccipTx.value || "0"; // Use actual CCIP fee value
      console.log("💰 CCIP Transaction Value:", {
        ccipValue: ccipTx.value,
        transferValue: transferValue,
        feeCalculation: "Using real router.getFee() result with buffer",
        note: "This ETH amount pays for CCIP fees (USDC sent separately via tokenAmounts)",
      });
      const gasLimit = "700000"; // Further increased gas limit for source chain transaction to prevent out-of-gas errors

      // MetaMask URI for CCIP USDC transfer - value=0 because we're calling a contract
      const metaMaskUri = `ethereum:${routerAddress}@${sourceChainId}?value=${transferValue}&gas=${gasLimit}`;

      // Add function selector for CCIP send (first 10 chars of data)
      const functionSelector = ccipTx.data.substring(0, 10);
      const metaMaskUriWithFunc = `${metaMaskUri}&data=${functionSelector}`;

      console.log("📱 MetaMask USDC CCIP URI:", {
        basic: metaMaskUri,
        withFunction: metaMaskUriWithFunc,
        transferType: "USDC (ERC-20)",
        ethValue: transferValue,
        ccipFeeETH: ethers.utils.formatEther(ccipTx.estimatedFee || "0"),
        length: metaMaskUriWithFunc.length,
      });

      // Generate high-quality QR for MetaMask scanning
      const metaMaskQR = await QRCode.toDataURL(metaMaskUriWithFunc, {
        width: 280,
        margin: 4,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H",
        type: "image/png",
      });

      return {
        success: true,
        qrData: metaMaskQR,
        uri: metaMaskUriWithFunc,
        optimizedFor: "MetaMask",
        isCrossChain: true, // CRITICAL: Top-level cross-chain flag
        transactionData: {
          to: routerAddress,
          value: transferValue,
          gas: gasLimit,
          data: ccipTx.data, // Full data for execution
          chainId: parseInt(sourceChainId),
          type: "ccip-metamask-optimized",
          isCrossChain: true, // CRITICAL: Mark as cross-chain transaction
        },
      };
    } catch (error) {
      console.error("❌ MetaMask QR generation failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // 🌉 CROSS-CHAIN QR GENERATION using CCIP
  async generateCrossChainQR(
    agentData,
    sourceChainId,
    destChainId,
    amount,
    feeToken = "native",
  ) {
    try {
      console.log("🌉 Generating CCIP cross-chain QR:", {
        source: sourceChainId,
        destination: destChainId,
        amount: amount,
        feeToken: feeToken,
      });

      // Get CCIP configuration for the source chain
      const sourceConfig = ccipConfigService.getNetworkConfig(sourceChainId);
      if (!sourceConfig) {
        throw new Error(`CCIP not supported on source chain: ${sourceChainId}`);
      }

      // Get destination chain selector
      const destConfig = ccipConfigService.getNetworkConfig(destChainId);
      if (!destConfig) {
        throw new Error(
          `CCIP not supported on destination chain: ${destChainId}`,
        );
      }

      // Build CCIP transaction (skip simulation for final QR generation)
      const ccipTx = await ccipConfigService.buildCCIPTransaction(
        sourceChainId,
        destChainId,
        amount,
        agentData.agent_wallet_address || agentData.payment_recipient_address,
        feeToken,
        true, // Skip simulation - already validated in modal
      );

      if (!ccipTx || !ccipTx.success) {
        throw new Error(
          `CCIP transaction build failed: ${
            ccipTx?.error || "undefined result"
          }`,
        );
      }

      // VALIDATION: Check fee amounts before proceeding
      const feeInETH = parseFloat(
        ethers.utils.formatEther(ccipTx.estimatedFee || "0"),
      );
      console.log("🔍 CCIP Fee Validation:", {
        estimatedFee: ccipTx.estimatedFee,
        feeInETH: feeInETH,
        feeInUSD: `$${(feeInETH * 2500).toFixed(2)}`,
        isReasonable: feeInETH < 0.01, // Should be less than 0.01 ETH (~$25)
        transactionValue: ccipTx.value,
      });

      // Safety check: Reject if fee is too high
      if (feeInETH > 0.01) {
        console.error("🚨 CCIP fee is too high:", feeInETH, "ETH");
        throw new Error(
          `CCIP fee too high: ${feeInETH} ETH. Max allowed: 0.01 ETH`,
        );
      }

      console.log("✅ CCIP transaction built successfully:", {
        to: ccipTx.to,
        value: ccipTx.value,
        dataLength: ccipTx.data?.length,
        chainId: ccipTx.chainId,
      });

      // Create EIP-681 URI for CCIP Router transaction
      const routerAddress = sourceConfig.router;
      const transactionData = ccipTx.data;
      const feeValue = ccipTx.value || "0"; // Correctly use ccipTx.value (which now contains the buffered fee)

      // Enhanced EIP-681 format with MetaMask compatibility
      // Add gas parameter and simplified format for better scanning
      const gasLimit = "700000"; // Further increased gas limit for source chain transaction to prevent out-of-gas errors
      const paymentUri = `ethereum:${routerAddress}@${sourceChainId}?value=${feeValue}&gas=${gasLimit}&data=${transactionData}`;

      console.log("🎯 CCIP QR Generated:", {
        router: routerAddress,
        uri: paymentUri,
        fee: feeValue,
        gas: gasLimit,
        dataLength: transactionData.length,
        uriLength: paymentUri.length,
      });

      // Generate QR code with enhanced settings for better MetaMask compatibility
      const qrCodeDataUrl = await QRCode.toDataURL(paymentUri, {
        width: 300, // Slightly larger for better scan quality
        margin: 3, // More margin for scanning apps
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "H", // Higher error correction for complex data
        type: "image/png", // Explicit PNG format
        quality: 1.0, // Maximum quality
      });

      // Also create a simplified fallback QR for basic scanners
      const simplifiedUri = `ethereum:${routerAddress}@${sourceChainId}`;
      const simplifiedQR = await QRCode.toDataURL(simplifiedUri, {
        width: 200,
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
        errorCorrectionLevel: "M",
      });

      return {
        success: true,
        qrData: qrCodeDataUrl,
        paymentUri: paymentUri,
        simplifiedQR: simplifiedQR,
        simplifiedUri: simplifiedUri,
        isCrossChain: true, // CRITICAL: Mark as cross-chain transaction
        debug: {
          routerAddress: routerAddress,
          sourceChain: sourceChainId,
          destinationChain: destChainId,
          feeValue: feeValue,
          gasLimit: gasLimit,
          dataLength: transactionData.length,
          uriLength: paymentUri.length,
          isMetaMaskCompatible: true,
        },
        transactionData: {
          to: routerAddress, // CCIP Router address (not USDC!)
          value: feeValue,
          data: transactionData,
          gas: gasLimit,
          chainId: parseInt(sourceChainId),
          chainType: "EVM",
          isCrossChain: true,
          sourceChain: sourceChainId,
          destChain: destChainId,
          amount: amount,
          recipient: agentData.agent_wallet_address,
          agentName: agentData.name || "Agent",
          tokenAddress: sourceConfig.usdc.tokenAddress, // Add for external scanners
        },
        ccipDetails: ccipTx,
      };
    } catch (error) {
      console.error("❌ Cross-chain QR generation failed:", error);
      return {
        success: false,
        error: error.message,
        isCrossChain: true,
      };
    }
  }

  // Enhanced QR generation with DUAL LOGIC: same-chain vs cross-chain
  async generateDynamicQR(agentData, amountUSD = null, paymentToken = null) {
    try {
      console.log(
        "🔗 Generating dynamic QR code for:",
        agentData?.name || "agent",
      );

      if (!agentData) {
        throw new Error("Agent data is required for QR generation");
      }

      // Extract payment details from agent data
      const walletAddress =
        agentData.agent_wallet_address || agentData.payment_recipient_address;

      // 💰 ONLY use amountUSD if explicitly provided (not null/undefined)
      // Otherwise use agent's fee amount
      const feeAmount =
        amountUSD !== null && amountUSD !== undefined
          ? amountUSD
          : agentData.interaction_fee_amount || agentData.fee_amount || "1.00";

      // 🪙 Use custom payment token if provided, otherwise use agent's default
      const feeToken =
        paymentToken ||
        agentData.interaction_fee_token ||
        agentData.fee_token ||
        "USDC";

      // Get agent chain ID - check deployment_chain_id first
      let agentChainId = String(
        agentData.deployment_chain_id ||
          agentData.chain_id ||
          agentData.network_id ||
          11155111,
      );

      // 🔧 CRITICAL FIX: Override chain ID if network name indicates Hedera but database has wrong value
      const networkName =
        agentData.deployment_network_name || agentData.network;
      if (networkName && networkName.toLowerCase().includes("hedera")) {
        console.log(
          "🔧 Hedera network detected from name - overriding chain ID to 296",
        );
        agentChainId = "296";
      }

      if (!walletAddress) {
        throw new Error("No wallet address found for QR generation");
      }

      // 🔐 VALIDATE CUSTOM STABLECOIN (if using custom token like USDh)
      if (
        feeToken !== "USDC" &&
        feeToken !== "SOL" &&
        parseInt(agentChainId) === 296
      ) {
        try {
          customStablecoinService.validateToken(
            feeToken,
            parseInt(agentChainId),
          );
          console.log(
            `✅ Custom stablecoin ${feeToken} validated for chain ${agentChainId}`,
          );
        } catch (validationError) {
          console.error(`❌ Token validation failed:`, validationError.message);
          throw validationError;
        }
      }

      // � SOLANA DETECTION: Check if agent is on Solana network
      const agentIsSolana =
        agentData.network === "Solana Devnet" ||
        agentData.deployment_network_name === "Solana Devnet" ||
        agentChainId === "devnet" ||
        agentChainId === "solana-devnet" ||
        (typeof agentChainId === "string" &&
          agentChainId.toLowerCase().includes("solana"));

      const isSolanaWallet =
        typeof window !== "undefined" && window.solana?.isConnected;

      console.log("🔍 Wallet/Network Detection:", {
        agentIsSolana,
        isSolanaWallet,
        agentChainId,
        agentNetwork: agentData.network,
        walletAddress,
      });

      // 🌟 If agent is on Solana, use Solana Pay format
      if (agentIsSolana) {
        console.log("🌟 Solana network detected → Generating Solana Pay QR");

        // Create Solana Pay URI format
        let solanaPayUri = `solana:${walletAddress}?amount=${feeAmount}&label=${encodeURIComponent(
          agentData.name || "AgentSphere Payment",
        )}&message=${encodeURIComponent(
          `Payment for ${agentData.name || "agent"}`,
        )}`;

        // Include SPL token if specified
        if (agentData.token_address && feeToken === "USDC") {
          solanaPayUri += `&spl-token=${agentData.token_address}`;
        }

        console.log("✅ Solana Pay URI generated:", solanaPayUri);

        return {
          success: true,
          qrData: solanaPayUri,
          paymentUri: solanaPayUri,
          transactionData: {
            to: walletAddress,
            amount: feeAmount,
            token: feeToken,
            tokenAddress: agentData.token_address,
            chainId: "devnet",
            chainType: "SVM",
            protocol: "solana",
          },
          networkInfo: { name: "Solana Devnet", type: "SVM" },
          chainType: "SVM",
          amount: feeAmount,
          token: feeToken,
          recipient: walletAddress,
          optimizedFor: "Phantom",
          isCrossChain: false,
        };
      }

      // �🎯 DUAL QR LOGIC: Detect user's current network and compare with agent's network (EVM ONLY)
      let userChainId = null;
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const currentChainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          userChainId = String(parseInt(currentChainId, 16));
          console.log("🌐 User connected to network:", userChainId);
        } catch (error) {
          console.warn("⚠️ Could not detect user network:", error);
        }
      }

      console.log("🎯 Network comparison:", {
        userNetwork: userChainId,
        agentNetwork: agentChainId,
        needsCrossChain: userChainId && userChainId !== agentChainId,
      });

      // 🎯 DECISION POINT: Same-chain vs Cross-chain
      if (userChainId && userChainId !== agentChainId) {
        // 🌉 DIFFERENT NETWORKS → Use CCIP Cross-Chain Logic
        console.log("🌉 Cross-chain payment detected, generating CCIP QR");

        // Try MetaMask-optimized QR first for better compatibility
        try {
          const metaMaskQR = await this.generateMetaMaskCompatibleQR(
            agentData,
            userChainId, // Source chain (user's current network)
            agentChainId, // Destination chain (agent's network)
            feeAmount,
            "native", // Fee token preference
          );

          if (metaMaskQR.success) {
            console.log("✅ MetaMask-optimized QR generated successfully");
            return {
              success: true,
              qrData: metaMaskQR.qrData,
              eip681URI: metaMaskQR.uri,
              transactionData: metaMaskQR.transactionData,
              networkInfo: { name: "Cross-Chain CCIP", type: "EVM" },
              chainType: "EVM",
              amount: feeAmount,
              token: feeToken,
              recipient: agentData.agent_wallet_address,
              optimizedFor: "MetaMask",
              isCrossChain: true, // CRITICAL: Mark as cross-chain transaction
            };
          }
        } catch (metaMaskError) {
          console.warn(
            "⚠️ MetaMask QR failed, falling back to standard:",
            metaMaskError.message,
          );
        }

        // Fallback to standard CCIP QR
        return await this.generateCrossChainQR(
          agentData,
          userChainId, // Source chain (user's current network)
          agentChainId, // Destination chain (agent's network)
          feeAmount,
          "native", // Fee token preference
        );
      }

      // ✅ SAME NETWORK OR NO USER NETWORK DETECTED → Use Standard Logic
      console.log("✅ Same-chain payment, using standard QR generation");

      // 🔧 FIX: Always use agent's network as target - do NOT override with user's wallet network
      // The cross-chain detection above already handles cases where networks differ
      let targetNetwork = parseInt(agentChainId) || 11155111;
      let chainType = this.detectChainType(targetNetwork);

      console.log(`🎯 Using agent's network for QR generation:`, {
        agentChainId,
        targetNetwork,
        chainType,
      });

      // For Solana networks, check if Phantom/Solflare is available
      if (
        chainType === "SVM" &&
        typeof window !== "undefined" &&
        (window.solana || window.phantom)
      ) {
        console.log("🌐 Detected Solana wallet available");
        targetNetwork = "solana-devnet"; // Use Solana devnet
      }

      // Get token address for current network
      let tokenAddress;

      console.log(`🔍 PRE-TOKEN LOOKUP DEBUG:`, {
        targetNetwork,
        targetNetworkType: typeof targetNetwork,
        feeToken,
        isCustomToken: feeToken !== "USDC" && feeToken !== "SOL",
        agentTokenAddress: agentData.token_address,
      });

      // 🎯 PRIORITY 1: Use agent's token_address if available (most reliable)
      if (agentData.token_address) {
        tokenAddress = agentData.token_address;
        console.log(`✅ Using agent's token_address directly:`, tokenAddress);
      }
      // 🪙 PRIORITY 2: Check if custom stablecoin (USDh, USDΔ, etc.)
      else if (feeToken !== "USDC" && feeToken !== "SOL") {
        // Get custom stablecoin address - ensure chainId is a number
        const chainIdNumber =
          typeof targetNetwork === "string"
            ? parseInt(targetNetwork)
            : targetNetwork;

        console.log(
          `🪙 Looking up custom stablecoin ${feeToken} on chain ${chainIdNumber}`,
        );

        tokenAddress = customStablecoinService.getTokenAddress(
          feeToken,
          chainIdNumber,
        );

        console.log(`🪙 Custom stablecoin lookup result:`, {
          token: feeToken,
          chainId: chainIdNumber,
          address: tokenAddress,
          found: !!tokenAddress,
        });

        if (!tokenAddress) {
          console.error(
            `❌ Custom stablecoin ${feeToken} not found on network ${chainIdNumber}`,
          );
          console.error(
            `Available custom stablecoins:`,
            customStablecoinService.getAvailableStablecoins(chainIdNumber),
          );
          throw new Error(
            `Custom stablecoin ${feeToken} not available on network ${targetNetwork}. ` +
              `Please select a different payment token.`,
          );
        }
      } else {
        // PRIORITY 3: Use standard USDC address
        tokenAddress = this.usdcTokenAddresses[targetNetwork];
        console.log(`💵 Using standard USDC address:`, tokenAddress);
      }

      const networkInfo = this.getNetworkInfo(targetNetwork);

      console.log(`🔍 DEBUGGING TOKEN ADDRESS LOOKUP:`, {
        targetNetwork: targetNetwork,
        targetNetworkType: typeof targetNetwork,
        tokenAddress: tokenAddress,
        hasTokenAddress: !!tokenAddress,
        availableNetworks: Object.keys(this.usdcTokenAddresses),
        networkInfo: networkInfo,
      });

      if (!networkInfo) {
        throw new Error(`Unsupported network: ${targetNetwork}`);
      }

      // Generate transaction data based on chain type
      let paymentUri;
      let transferData;

      if (this.isEVMNetwork(targetNetwork)) {
        // EVM network handling
        transferData = this.generateTransferData(
          walletAddress,
          feeAmount,
          feeToken,
          tokenAddress,
        );

        console.log(`🔍 Generated ERC-20 transfer data:`, {
          transferData,
          dataLength: transferData.length,
          recipient: walletAddress,
          amount: feeAmount,
          token: feeToken,
          tokenAddress,
        });

        // Create mobile-compatible EIP-681 URI for scanning with chain ID
        if (tokenAddress) {
          // ERC-20 token transfer URI format with chain ID
          const amountInDecimals = Math.floor(
            parseFloat(feeAmount) * Math.pow(10, 6),
          ); // All custom stablecoins use 6 decimals
          paymentUri = `ethereum:${tokenAddress}@${targetNetwork}/transfer?address=${walletAddress}&uint256=${amountInDecimals}`;
          console.log(
            `📱 Generated EIP-681 for ERC-20 on chain ${targetNetwork}: ${paymentUri}`,
          );
          console.log(`🔍 EIP-681 Details:`, {
            tokenContract: tokenAddress,
            recipientWallet: walletAddress,
            amount: feeAmount,
            amountInDecimals: amountInDecimals,
            decimals: 6,
            token: feeToken,
            chainId: targetNetwork,
          });
        } else {
          // CRITICAL: No native token support - all payments must be ERC-20 stablecoins
          console.error(
            `❌ Token address not found for network ${targetNetwork}`,
          );
          console.error(
            `Available networks:`,
            Object.keys(this.usdcTokenAddresses),
          );
          throw new Error(
            `Token address not configured for network ${targetNetwork}. ` +
              `All payments must use ERC-20 stablecoins. ` +
              `Available networks: ${Object.keys(this.usdcTokenAddresses).join(
                ", ",
              )}`,
          );
        }
      } else if (this.isSolanaNetwork(targetNetwork)) {
        // Solana network handling
        transferData = ""; // Solana doesn't use data field like EVM

        // Create Solana Pay URI format
        const amountInDecimals = parseFloat(feeAmount); // USDC on Solana also has 6 decimals
        paymentUri = `solana:${tokenAddress}?amount=${amountInDecimals}&spl-token=${tokenAddress}&recipient=${walletAddress}`;
        console.log(`📱 Generated Solana Pay URI: ${paymentUri}`);
      }

      // Create QR code data for click handling
      const clickData = {
        to: tokenAddress || walletAddress,
        value:
          this.isEVMNetwork(targetNetwork) && tokenAddress
            ? "0"
            : this.isEVMNetwork(targetNetwork)
            ? this.parseAmount(feeAmount)
            : "0",
        data: transferData,
        chainId: targetNetwork,
        chainType: chainType,
        amount: feeAmount,
        token: feeToken,
        recipient: walletAddress,
        agentName: agentData.name || "Agent",
        networkInfo: networkInfo,
        isCrossChain: false, // This is same-chain logic
      };

      // Generate QR code using the appropriate URI format
      const qrCodeDataUrl = await QRCode.toDataURL(paymentUri, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      console.log("✅ QR code generated successfully");
      console.log(`📱 Payment URI (${chainType}):`, paymentUri);
      console.log(`🔍 URI Length: ${paymentUri.length} characters`);
      console.log(`🔍 QR Data URL Length: ${qrCodeDataUrl.length} characters`);

      return {
        success: true,
        qrData: qrCodeDataUrl,
        paymentUri: paymentUri,
        transactionData: clickData,
        network: targetNetwork,
        networkInfo: networkInfo,
        chainType: chainType,
        amount: feeAmount,
        token: feeToken,
        recipient: walletAddress,
      };
    } catch (error) {
      console.error("❌ QR generation failed:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Agent data:", agentData);
      console.error(
        "❌ Fee token:",
        paymentToken || agentData.interaction_fee_token,
      );
      return {
        success: false,
        error: error.message,
      };
    }
  }

  generateTransferData(
    recipientAddress,
    amount,
    token = "USDC",
    tokenAddress = null,
  ) {
    if (!tokenAddress) {
      // Direct ETH transfer - no data needed
      return "0x";
    }

    // ERC-20 transfer function signature: transfer(address,uint256)
    const functionSignature = "0xa9059cbb"; // transfer function

    // Encode recipient address (32 bytes, padded)
    const encodedRecipient = recipientAddress
      .replace("0x", "")
      .padStart(64, "0");

    // All custom stablecoins use 6 decimals (USDh, USDC, USDT, etc.)
    const decimals = 6;
    const amountWei = (parseFloat(amount) * Math.pow(10, decimals))
      .toString(16)
      .padStart(64, "0");

    return functionSignature + encodedRecipient + amountWei;
  }

  parseAmount(amount) {
    // Convert amount to wei for ETH transactions
    return (parseFloat(amount) * Math.pow(10, 18)).toString(16);
  }

  async handleQRClick(agentData, qrData) {
    try {
      console.log("🔥 QR Code clicked! Attempting transaction...");
      console.log("🔍 QR Data received:", qrData);
      console.log("🔍 Chain ID:", qrData.chainId);
      console.log("🔍 Chain Type from data:", qrData.chainType);

      const chainType =
        qrData.chainType || this.detectChainType(qrData.chainId);

      console.log("🔍 Detected Chain Type:", chainType);

      if (chainType === "EVM") {
        return await this.handleEVMTransaction(qrData);
      } else if (chainType === "SVM") {
        return await this.handleSolanaTransaction(qrData);
      } else {
        throw new Error(`Unsupported chain type: ${chainType}`);
      }
    } catch (error) {
      console.error("❌ Transaction failed:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  async handleEVMTransaction(qrData) {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error(
        "MetaMask not detected. Please install MetaMask to proceed with the transaction.",
      );
    }

    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    if (!accounts || accounts.length === 0) {
      throw new Error("No accounts connected. Please connect your wallet.");
    }

    const fromAddress = accounts[0];
    console.log("👤 Connected EVM account:", fromAddress);

    // Prepare transaction parameters with proper hex conversion
    const transactionParams = {
      from: fromAddress,
      to: qrData.to,
      value:
        qrData.value === "0"
          ? "0x0"
          : ethers.BigNumber.from(qrData.value).toHexString(),
      data: qrData.data || "0x",
      gas: qrData.isCrossChain ? "0xf4240" : "0x15f90", // 1,000,000 gas for CCIP, 90,000 for regular transfers
    };

    console.log("🔧 EVM Transaction params prepared:", {
      to: transactionParams.to,
      value: transactionParams.value,
      dataLength: transactionParams.data.length,
      gas: transactionParams.gas,
      isCrossChain: qrData.isCrossChain || false,
    });

    // CRITICAL DEBUG: Log the QR data to understand cross-chain flag issue
    console.log("🔍 QR Data Debug:", {
      qrDataIsCrossChain: qrData.isCrossChain,
      qrDataType: qrData.type,
      hasTransactionData: !!qrData.transactionData,
      transactionDataIsCrossChain: qrData.transactionData?.isCrossChain,
    });

    // Check if we need to switch networks
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const targetChainId = "0x" + qrData.chainId.toString(16);

    if (currentChainId !== targetChainId) {
      console.log(
        `🔄 Switching network from ${currentChainId} to ${targetChainId}`,
      );
      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: targetChainId }],
        });
      } catch (switchError) {
        console.warn(
          "⚠️ Network switch failed, proceeding with current network",
        );
      }
    }

    // Cross-chain transactions should have allowance already approved via modal
    if (qrData.isCrossChain && qrData.transactionData) {
      console.log(
        "� Cross-chain transaction detected - assuming allowance approved via modal",
      );
      console.log("� CCIP Transaction details:", {
        sourceChain: qrData.transactionData.sourceChain,
        amount: qrData.transactionData.amount,
        userAddress: fromAddress,
      });
    }

    // Send transaction
    console.log("📤 Sending EVM transaction:", transactionParams);
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParams],
    });

    console.log("✅ EVM Transaction sent! Hash:", txHash);

    return {
      success: true,
      transactionHash: txHash,
      message: "Transaction sent successfully!",
      chainType: "EVM",
      isCrossChain: qrData.isCrossChain || false,
    };
  }

  async handleSolanaTransaction(qrData) {
    console.log("🌟 Executing REAL Solana transaction:", qrData);

    // Prioritize Phantom wallet over Brave's built-in wallet
    const wallet =
      (typeof window !== "undefined" && window.phantom?.solana) ||
      window.solana;

    if (typeof window === "undefined" || !wallet) {
      throw new Error(
        "Solana wallet not detected. Please install Phantom or another Solana wallet.",
      );
    }

    // Try to connect to Solana wallet (Phantom, Solflare, etc.)
    console.log(
      "🔍 Using wallet:",
      wallet.isPhantom ? "Phantom" : "Other Solana wallet",
    );

    if (!wallet.isConnected) {
      await wallet.connect();
    }

    console.log("👤 Connected Solana account:", wallet.publicKey.toString());

    // Import payment processor to handle the actual transaction
    const { default: paymentProcessor } = await import("./paymentProcessor.js");

    // Create payment URI in Solana Pay format
    const paymentUri = `solana:${qrData.to}?amount=${qrData.amount}&label=AgentSphere%20Payment`;

    const paymentData = {
      payment_uri: paymentUri,
      data: paymentUri,
      qrObject: {
        amount: qrData.amount,
        agent: { name: qrData.agentName || "Agent" },
      },
    };

    console.log("💳 Processing Solana payment:", paymentData);

    // Use payment processor to execute the transaction
    const result = await paymentProcessor.processQRPayment(paymentData);

    console.log("✅ Solana transaction result:", result);

    return result;
  }

  // Balance fetching methods (keeping original functionality)
  async fetchUSDCBalance(walletAddress, chainId) {
    try {
      console.log(
        `💰 Fetching USDC balance for ${walletAddress} on chain ${chainId}`,
      );

      const chainType = this.detectChainType(chainId);

      if (chainType === "EVM") {
        return await this.fetchEVMUSDCBalance(walletAddress, chainId);
      } else if (chainType === "SVM") {
        return await this.fetchSolanaUSDCBalance(walletAddress);
      } else {
        throw new Error(`Unsupported chain type: ${chainType}`);
      }
    } catch (error) {
      console.error("❌ Balance fetch error:", error);
      return {
        success: false,
        balance: "0",
        formatted: "0.00 USDC",
        error: error.message,
      };
    }
  }

  async fetchEVMUSDCBalance(walletAddress, chainId) {
    if (!window.ethereum) {
      throw new Error("MetaMask not available");
    }

    // 🔍 DEBUG: Log incoming chainId
    console.log(
      "🔍 fetchEVMUSDCBalance called with chainId:",
      chainId,
      "Type:",
      typeof chainId,
    );

    const networkInfo = this.getNetworkInfo(chainId);

    // 🔧 HEDERA SPECIAL CASE: Use native HBAR balance instead of USDC
    // Convert to number for comparison since chainId might be string or number
    if (parseInt(chainId) === 296 || chainId === 296 || chainId === "296") {
      console.log("🔧 Fetching native HBAR balance for Hedera");
      try {
        const balanceHex = await window.ethereum.request({
          method: "eth_getBalance",
          params: [walletAddress, "latest"],
        });
        const balanceWei = parseInt(balanceHex, 16);
        const balanceHBAR = balanceWei / Math.pow(10, 18); // HBAR has 18 decimals
        console.log(`✅ HBAR Balance: ${balanceHBAR.toFixed(4)} HBAR`);
        return balanceHBAR.toFixed(2);
      } catch (error) {
        console.error("❌ Error fetching HBAR balance:", error);
        throw new Error(`Failed to fetch HBAR balance: ${error.message}`);
      }
    }

    if (!networkInfo || !networkInfo.usdcAddress) {
      throw new Error(`USDC not supported on chain ${chainId}`);
    }

    console.log(`🌐 Network Info for chain ${chainId}:`, {
      name: networkInfo.name,
      usdcAddress: networkInfo.usdcAddress,
      rpcUrl: networkInfo.rpcUrl || "Using MetaMask provider",
      purpose:
        chainId === 84532
          ? "SOURCE (Base Sepolia) - Should have USDC"
          : chainId === 11155111
          ? "DESTINATION (Ethereum Sepolia) - May have 0 USDC"
          : "OTHER",
    });

    try {
      // ERC-20 balanceOf ABI
      const balanceOfABI = [
        {
          constant: true,
          inputs: [{ name: "_owner", type: "address" }],
          name: "balanceOf",
          outputs: [{ name: "balance", type: "uint256" }],
          type: "function",
        },
      ];

      // Create contract call data
      const data = window.ethereum.utils?.encodeFunctionCall
        ? window.ethereum.utils.encodeFunctionCall(balanceOfABI[0], [
            walletAddress,
          ])
        : this.encodeBalanceOfCall(walletAddress);

      console.log(
        `🔍 Using encoding method:`,
        window.ethereum.utils?.encodeFunctionCall
          ? "MetaMask utils"
          : "Custom encoding",
      );
      console.log(`🔍 Encoded call data:`, data);

      // Call contract
      const balance = await window.ethereum.request({
        method: "eth_call",
        params: [
          {
            to: networkInfo.usdcAddress,
            data: data,
          },
          "latest",
        ],
      });

      console.log(`🔍 Raw balance response:`, balance);
      console.log(`🔍 USDC contract address:`, networkInfo.usdcAddress);
      console.log(`🔍 Call data:`, data);

      // Parse balance (USDC has 6 decimals) with proper error handling
      let balanceInWei = 0;
      try {
        if (balance && typeof balance === "string" && balance !== "0x") {
          balanceInWei = parseInt(balance, 16);
          if (isNaN(balanceInWei)) {
            console.warn(`⚠️ Invalid balance format, using 0:`, balance);
            balanceInWei = 0;
          }
        } else {
          console.warn(
            `⚠️ Empty or invalid balance response, using 0:`,
            balance,
          );
          balanceInWei = 0;
        }
      } catch (error) {
        console.error(`❌ Error parsing balance, using 0:`, error, balance);
        balanceInWei = 0;
      }
      console.log(`🔍 Balance in wei:`, balanceInWei);

      const balanceInUSDC = balanceInWei / Math.pow(10, 6);
      console.log(
        `🔍 Balance calculation: ${balanceInWei} / ${Math.pow(
          10,
          6,
        )} = ${balanceInUSDC}`,
      );

      console.log(`✅ EVM USDC Balance: ${balanceInUSDC} USDC`);

      return {
        success: true,
        balance: balanceInWei.toString(),
        formatted: `${balanceInUSDC.toFixed(2)} USDC`,
        network: networkInfo.name,
        chainId: chainId,
      };
    } catch (error) {
      console.error(`❌ EVM balance fetch error for chain ${chainId}:`, error);
      return {
        success: false,
        balance: "0",
        formatted: "0.00 USDC",
        error: error.message,
        network: networkInfo.name,
        chainId: chainId,
      };
    }
  }

  async fetchSolanaUSDCBalance(walletAddress) {
    if (!window.phantom?.solana && !window.solana) {
      throw new Error("Solana wallet not available");
    }

    try {
      // Placeholder implementation - would need @solana/web3.js and @solana/spl-token
      console.log("🔄 Fetching Solana USDC balance (placeholder)...");

      return {
        success: true,
        balance: "1000000", // 1 USDC in micro-units (6 decimals)
        formatted: "1.00 USDC",
        network: "Solana Devnet",
        chainId: "solana-devnet",
        note: "Placeholder balance - requires full Solana integration",
      };
    } catch (error) {
      console.error("❌ Solana balance fetch error:", error);
      return {
        success: false,
        balance: "0",
        formatted: "0.00 USDC",
        error: error.message,
        network: "Solana Devnet",
        chainId: "solana-devnet",
      };
    }
  }

  // Helper method to encode balanceOf function call
  encodeBalanceOfCall(address) {
    // balanceOf(address) function selector: 0x70a08231
    const functionSelector = "0x70a08231";
    // Remove 0x prefix and pad address to 32 bytes
    const paddedAddress = address.slice(2).padStart(64, "0");
    return functionSelector + paddedAddress;
  }

  // Get current wallet balance for display
  async getCurrentWalletBalance(chainId) {
    try {
      const chainType = this.detectChainType(chainId);

      if (chainType === "EVM") {
        if (!window.ethereum) return null;

        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts && accounts.length > 0) {
          return await this.fetchUSDCBalance(accounts[0], chainId);
        }
      } else if (chainType === "SVM") {
        const wallet = window.phantom?.solana || window.solana;
        if (wallet && wallet.isConnected) {
          return await this.fetchUSDCBalance(
            wallet.publicKey.toString(),
            chainId,
          );
        }
      }

      return null;
    } catch (error) {
      console.error("❌ Current wallet balance error:", error);
      return null;
    }
  }

  // 🔧 COMPATIBILITY METHODS for CubePaymentEngine
  getCCIPService() {
    // Return the imported CCIP service for compatibility
    return ccipConfigService;
  }

  getAvailablePaymentOptions(agent, userNetwork) {
    // Return available payment options based on network
    const agentNetwork = String(agent.chain_id || agent.network_id || 11155111);
    const isInnerChain = userNetwork === agentNetwork;
    const supportsCrossChain =
      !isInnerChain &&
      ccipConfigService.isRouteSupported(userNetwork, agentNetwork);

    const options = [];

    // Add same-chain option if available
    if (isInnerChain) {
      options.push({
        type: "same-chain",
        label: "Direct Payment",
        description: "Pay directly on the same network",
        available: true,
      });
    }

    // Add cross-chain option if available
    if (supportsCrossChain) {
      options.push({
        type: "cross-chain",
        label: "Cross-Chain Payment",
        description: "Pay from your current network using CCIP",
        available: true,
      });
    }

    // Return both object format (for backward compatibility) and array format
    return {
      sameChain: isInnerChain,
      crossChain: supportsCrossChain,
      supportedMethods: ["standard", "ccip"],
      options: options, // Array format for React components
    };
  }

  async handleCrossChainQRClick(qrData) {
    // Handle cross-chain QR click - delegate to standard handler
    return await this.handleQRClick(null, qrData);
  }
}

export const dynamicQRService = new DynamicQRService();
export default dynamicQRService;
