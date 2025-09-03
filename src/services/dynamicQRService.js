// Dynamic QR Service for AR Viewer
// Handles EVM network autodetection and QR generation
// Based on existing payment patterns from main branch

import {
  networkDetectionService,
  SUPPORTED_EVM_NETWORKS,
} from "./networkDetectionService";
import QRCode from "qrcode";

class DynamicQRService {
  constructor() {
    this.currentNetwork = null;
    // USDC token addresses for supported EVM testnets
    this.usdcTokenAddresses = {
      11155111: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Ethereum Sepolia
      421614: "0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d", // Arbitrum Sepolia
      84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
      11155420: "0x5fd84259d66Cd46123540766Be93DFE6D43130D7", // OP Sepolia
      43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // Avalanche Fuji
    };
  }

  async generateDynamicQR(agentData, amountUSD = null) {
    try {
      // 1. Use dynamic deployment data (NEW - with fallback to legacy)
      const deploymentChainId =
        agentData.deployment_chain_id || agentData.chain_id;
      const deploymentNetwork =
        agentData.deployment_network_name || agentData.network;

      // 2. Use dynamic interaction fee (NEW - with fallback to legacy)
      const interactionFee =
        amountUSD ||
        agentData.interaction_fee_amount ||
        agentData.interaction_fee ||
        1.0; // Final fallback
      const feeToken =
        agentData.interaction_fee_token || agentData.currency_type || "USDC"; // Default to USDC

      // 3. Use dynamic wallet address (NEW - with fallback to legacy)
      const recipientAddress =
        agentData.payment_config?.wallet_address ||
        agentData.wallet_address ||
        agentData.deployer_address ||
        agentData.payment_recipient_address;

      console.log("🌐 Using dynamic deployment data:");
      console.log("- Agent ID:", agentData.id);
      console.log(
        "- Network:",
        deploymentNetwork,
        "(Chain ID:",
        deploymentChainId + ")"
      );
      console.log("- Interaction Fee:", interactionFee, feeToken);
      console.log("- Recipient Wallet:", recipientAddress);
      console.log("- Has Payment Config:", !!agentData.payment_config);

      // Detect user's current network
      const userNetwork = await networkDetectionService.detectCurrentNetwork();

      if (!userNetwork || userNetwork.isSupported === false) {
        throw new Error(
          "Please switch to a supported network to make payments"
        );
      }

      console.log(
        "🔍 User network:",
        userNetwork.name,
        "Chain ID:",
        userNetwork.chainId
      );

      // Validate network compatibility (use agent's deployment network)
      if (deploymentChainId && userNetwork.chainId !== deploymentChainId) {
        console.warn(
          `⚠️ Network mismatch: Agent deployed on ${deploymentNetwork} (${deploymentChainId}), user on ${userNetwork.name} (${userNetwork.chainId})`
        );

        // For now, continue with user's network but log the mismatch
        // In production, you might want to prompt user to switch networks
      }

      // Get USDC token address for user's network (or agent's preferred network)
      const targetChainId =
        deploymentChainId && this.isNetworkSupported(deploymentChainId)
          ? deploymentChainId
          : userNetwork.chainId;

      const usdcAddress = this.usdcTokenAddresses[targetChainId];
      if (!usdcAddress) {
        throw new Error(`USDC not supported on network ${targetChainId}`);
      }

      // Calculate token amount (support for different stablecoins)
      let tokenAmount = interactionFee;
      let tokenDecimals = 6; // Default USDC decimals

      // Adjust for different tokens
      if (feeToken === "USDT" || feeToken === "USDC") {
        tokenDecimals = 6;
      } else if (feeToken === "USBDG+" || feeToken === "USDFC") {
        tokenDecimals = 18; // Assuming 18 decimals for custom tokens
      }

      const tokenAmountWei = this.toTokenUnits(tokenAmount, tokenDecimals);

      if (!recipientAddress) {
        throw new Error(
          "Agent wallet address not found - cannot generate payment QR"
        );
      }

      console.log("💰 Payment details:");
      console.log("- Amount:", tokenAmount, feeToken);
      console.log("- Amount (wei):", tokenAmountWei);
      console.log("- Recipient:", recipientAddress);
      console.log("- Token contract:", usdcAddress);
      console.log("- Target network:", targetChainId);

      // Generate payment transaction data (EIP-681 format)
      const paymentData = {
        chainId: targetChainId,
        to: usdcAddress, // Token contract address
        data: this.encodeUSDCTransfer(recipientAddress, tokenAmountWei),
        value: "0", // No ETH value for ERC-20 transfers
        gasLimit: "100000", // Estimated gas limit for token transfer
      };

      // Generate EIP-681 format payment URI
      const eip681URI = this.generateEIP681URI(paymentData);
      console.log("📱 Generated EIP-681 URI:", eip681URI);

      // Generate QR code image
      const qrCodeUrl = await this.generateQRCodeImage(eip681URI);

      return {
        qrCodeUrl: qrCodeUrl,
        paymentData: paymentData,
        eip681URI: eip681URI,
        networkInfo: {
          chainId: targetChainId,
          name: deploymentNetwork || userNetwork.name,
          blockExplorer: userNetwork.blockExplorer,
        },
        tokenInfo: {
          address: usdcAddress,
          symbol: feeToken,
          decimals: tokenDecimals,
          amount: tokenAmount,
        },
        recipientAddress: recipientAddress,
        agentInfo: {
          id: agentData.id,
          name: agentData.name,
          deploymentNetwork: deploymentNetwork,
          deploymentChainId: deploymentChainId,
          hasDynamicData: !!(
            agentData.deployment_chain_id || agentData.interaction_fee_amount
          ),
        },
      };
    } catch (error) {
      console.error("❌ Failed to generate dynamic QR:", error);
      throw error;
    }
  }

  // Generate EIP-681 format URI for wallet compatibility (IMPROVED)
  generateEIP681URI(paymentData) {
    const { chainId, to, data } = paymentData;

    // Parse the encoded transfer data to extract recipient and amount
    const recipient = "0x" + data.slice(34, 74); // Extract recipient from data
    const amount = "0x" + data.slice(74, 138); // Extract amount from data

    // Standard EIP-681 format for token transfers:
    // ethereum:<contract>@<chainId>/transfer?address=<recipient>&uint256=<amount>
    const uri = `ethereum:${to}@${chainId}/transfer?address=${recipient}&uint256=${parseInt(
      amount,
      16
    )}`;

    console.log("🔗 Generated EIP-681 URI:", uri);
    console.log("📊 URI components:");
    console.log("- Contract:", to);
    console.log("- Chain ID:", chainId);
    console.log("- Recipient:", recipient);
    console.log("- Amount (decimal):", parseInt(amount, 16));

    return uri;
  }

  // Encode USDC transfer function call
  encodeUSDCTransfer(recipientAddress, amount) {
    // ERC-20 transfer function signature: transfer(address,uint256)
    const functionSignature = "0xa9059cbb";

    // Remove '0x' prefix and pad to 32 bytes (64 hex characters)
    const paddedRecipient = recipientAddress
      .slice(2)
      .toLowerCase()
      .padStart(64, "0");

    // Convert amount to hex and pad to 32 bytes
    const paddedAmount = amount.toString(16).padStart(64, "0");

    return functionSignature + paddedRecipient + paddedAmount;
  }

  // Convert decimal amount to token units (considering decimals)
  toTokenUnits(amount, decimals) {
    return Math.floor(amount * Math.pow(10, decimals));
  }

  // Generate QR code image from data
  async generateQRCodeImage(data) {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(data, {
        width: 300,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      return qrCodeDataURL;
    } catch (error) {
      console.error("❌ QR code generation failed:", error);
      throw new Error("Failed to generate QR code image");
    }
  }

  // Execute payment transaction (based on existing paymentProcessor patterns)
  async executePayment(qrData) {
    if (!qrData || !qrData.paymentData) {
      throw new Error("No payment data available");
    }

    try {
      console.log("💳 Executing USDC payment...");

      // Check if wallet is connected
      if (!window.ethereum) {
        throw new Error("Please install MetaMask to make payments");
      }

      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length === 0) {
        throw new Error("Please connect your wallet first");
      }

      // Verify user is on correct network
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const numericChainId = parseInt(currentChainId, 16);

      if (numericChainId !== qrData.paymentData.chainId) {
        throw new Error(
          `Please switch to ${qrData.networkInfo.name} to complete payment`
        );
      }

      console.log("🔐 Requesting wallet signature...");

      // Execute the payment transaction
      const transactionHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [
          {
            from: accounts[0],
            to: qrData.paymentData.to,
            data: qrData.paymentData.data,
            value: qrData.paymentData.value,
            gas: `0x${parseInt(qrData.paymentData.gasLimit).toString(16)}`,
          },
        ],
      });

      console.log("✅ Payment transaction sent:", transactionHash);

      // Wait for transaction confirmation (optional)
      const receipt = await this.waitForTransaction(transactionHash);

      return {
        transactionHash,
        receipt,
        amount: qrData.tokenInfo.amount,
        token: qrData.tokenInfo.symbol,
        network: qrData.networkInfo.name,
        recipient: qrData.recipientAddress,
        explorerUrl: `${qrData.networkInfo.blockExplorer}/tx/${transactionHash}`,
      };
    } catch (error) {
      console.error("❌ Payment execution failed:", error);

      if (error.code === 4001) {
        throw new Error("Payment cancelled by user");
      } else if (error.code === -32000) {
        throw new Error("Insufficient funds for transaction");
      } else {
        throw new Error(`Payment failed: ${error.message}`);
      }
    }
  }

  // Wait for transaction to be mined (similar to existing implementation)
  async waitForTransaction(txHash, timeout = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });

        if (receipt) {
          console.log("✅ Transaction confirmed:", receipt);
          return receipt;
        }

        // Wait 2 seconds before checking again
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error("Error checking transaction status:", error);
      }
    }

    throw new Error("Transaction confirmation timeout");
  }

  // Validate agent data completeness and network compatibility
  validateAgentData(agent) {
    const validation = {
      hasLegacyData: !!(
        agent.chain_id &&
        agent.network &&
        agent.interaction_fee
      ),
      hasDynamicData: !!(
        agent.deployment_chain_id &&
        agent.deployment_network_name &&
        agent.interaction_fee_amount
      ),
      hasPaymentConfig: !!(
        agent.payment_config && agent.payment_config.wallet_address
      ),
      hasWalletAddress: !!(
        agent.wallet_address ||
        agent.payment_config?.wallet_address ||
        agent.deployer_address
      ),
      isComplete: false,
      dataSource: "unknown",
    };

    // Determine data source and completeness
    if (validation.hasDynamicData) {
      validation.dataSource = "dynamic";
      validation.isComplete = !!(
        agent.deployment_chain_id &&
        agent.deployment_network_name &&
        agent.interaction_fee_amount &&
        validation.hasWalletAddress
      );
    } else if (validation.hasLegacyData) {
      validation.dataSource = "legacy";
      validation.isComplete = !!(
        agent.chain_id &&
        agent.network &&
        agent.interaction_fee &&
        validation.hasWalletAddress
      );
    }

    console.log("📊 Agent data validation:", validation);
    return validation;
  }

  // Validate network compatibility between agent and user
  validateNetworkCompatibility(agent, userNetwork) {
    // Use dynamic deployment data with fallback to legacy
    const agentChainId = agent.deployment_chain_id || agent.chain_id;
    const agentNetworkName = agent.deployment_network_name || agent.network;

    if (!agentChainId) {
      return {
        compatible: false,
        message: "Agent deployment network information is missing",
        severity: "error",
      };
    }

    if (agentChainId !== userNetwork.chainId) {
      return {
        compatible: false,
        message: `This agent is deployed on ${agentNetworkName} (Chain ${agentChainId}). Please switch to this network to interact.`,
        severity: "warning",
        requiredNetwork: {
          chainId: agentChainId,
          name: agentNetworkName,
          rpcUrl: agent.payment_config?.network_info?.rpcUrl,
        },
        userNetwork: {
          chainId: userNetwork.chainId,
          name: userNetwork.name,
        },
      };
    }

    return {
      compatible: true,
      message: `Networks compatible: ${agentNetworkName}`,
      severity: "success",
    };
  }

  // Get comprehensive agent payment configuration
  getAgentPaymentConfig(agent) {
    return {
      // Use dynamic fields with fallback to legacy
      chainId: agent.deployment_chain_id || agent.chain_id,
      networkName: agent.deployment_network_name || agent.network,
      interactionFee: agent.interaction_fee_amount || agent.interaction_fee,
      feeToken: agent.interaction_fee_token || agent.currency_type || "USDC",

      // Wallet addresses (prioritize payment config)
      walletAddress:
        agent.payment_config?.wallet_address ||
        agent.wallet_address ||
        agent.deployer_address ||
        agent.payment_recipient_address,

      // Token and network info
      tokenAddress: agent.token_address,
      networkConfig: agent.payment_config?.network_info,

      // Metadata
      supportedTokens: agent.payment_config?.supported_tokens || [
        agent.interaction_fee_token || agent.currency_type || "USDC",
      ],
      deploymentStatus: agent.deployment_status || "active",
      deployedAt: agent.deployed_at || agent.created_at,

      // Data source tracking
      isUsingDynamicData: !!(
        agent.deployment_chain_id || agent.interaction_fee_amount
      ),
      dataCompleteness: this.validateAgentData(agent),
    };
  }

  // Validate network support
  isNetworkSupported(chainId) {
    return Object.keys(this.usdcTokenAddresses).includes(chainId.toString());
  }

  // Get supported networks info
  getSupportedNetworks() {
    return Object.values(SUPPORTED_EVM_NETWORKS);
  }
}

export const dynamicQRService = new DynamicQRService();
export default dynamicQRService;
