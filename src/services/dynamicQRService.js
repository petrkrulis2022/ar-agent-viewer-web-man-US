// Dynamic QR Service for AR Viewer
// Handles EVM network autodetection and QR generation
// Based on existing payment patterns from main branch

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
      console.log(
        "🔗 Generating dynamic QR code for:",
        agentData?.name || "agent"
      );

      if (!agentData) {
        throw new Error("Agent data is required for QR generation");
      }

      // Extract payment details from agent data
      const walletAddress =
        agentData.agent_wallet_address || agentData.payment_recipient_address;
      const feeAmount =
        agentData.interaction_fee_amount || agentData.fee_amount || "1.00";
      const feeToken =
        agentData.interaction_fee_token || agentData.fee_token || "USDC";
      const chainId = agentData.chain_id || 11155111; // Default to Ethereum Sepolia

      if (!walletAddress) {
        throw new Error("No wallet address found for QR generation");
      }

      // Detect current network if connected
      let targetNetwork = chainId;
      if (typeof window !== "undefined" && window.ethereum) {
        try {
          const currentChainId = await window.ethereum.request({
            method: "eth_chainId",
          });
          targetNetwork = parseInt(currentChainId, 16);
          console.log("🌐 Detected network:", targetNetwork);
        } catch (error) {
          console.warn(
            "⚠️ Could not detect network, using default:",
            targetNetwork
          );
        }
      }

      // Get token address for current network
      const tokenAddress = this.usdcTokenAddresses[targetNetwork];

      // Generate transaction data for ERC-20 transfer
      const transferData = this.generateTransferData(
        walletAddress,
        feeAmount,
        feeToken,
        tokenAddress
      );

      // Create mobile-compatible EIP-681 URI for scanning with chain ID
      let eip681Uri;
      if (tokenAddress) {
        // ERC-20 token transfer URI format with chain ID
        const amountInDecimals = Math.floor(
          parseFloat(feeAmount) * Math.pow(10, 6)
        ); // USDC has 6 decimals
        eip681Uri = `ethereum:${tokenAddress}@${targetNetwork}/transfer?address=${walletAddress}&uint256=${amountInDecimals}`;
        console.log(
          `📱 Generated EIP-681 for ERC-20 on chain ${targetNetwork}: ${eip681Uri}`
        );
      } else {
        // Direct ETH transfer URI format with chain ID
        const amountInWei = this.parseAmount(feeAmount);
        eip681Uri = `ethereum:${walletAddress}@${targetNetwork}?value=${amountInWei}`;
        console.log(
          `📱 Generated EIP-681 for ETH on chain ${targetNetwork}: ${eip681Uri}`
        );
      }

      // Create QR code data for click handling (original format)
      const clickData = {
        to: tokenAddress || walletAddress,
        value: tokenAddress ? "0" : this.parseAmount(feeAmount),
        data: transferData,
        chainId: targetNetwork,
        amount: feeAmount,
        token: feeToken,
        recipient: walletAddress,
        agentName: agentData.name || "Agent",
      };

      // Generate QR code using EIP-681 URI for mobile compatibility
      const qrCodeDataUrl = await QRCode.toDataURL(eip681Uri, {
        width: 256,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
        errorCorrectionLevel: "M",
      });

      console.log("✅ QR code generated successfully");
      console.log("📱 EIP-681 URI for mobile:", eip681Uri);

      return {
        success: true,
        qrData: qrCodeDataUrl,
        eip681Uri: eip681Uri,
        transactionData: clickData,
        network: targetNetwork,
        amount: feeAmount,
        token: feeToken,
        recipient: walletAddress,
      };
    } catch (error) {
      console.error("❌ QR generation failed:", error);
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
    tokenAddress = null
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

    // Convert amount to wei (assuming 6 decimals for USDC)
    const decimals = token === "USDC" ? 6 : 18;
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

      if (typeof window === "undefined" || !window.ethereum) {
        throw new Error(
          "MetaMask not detected. Please install MetaMask to proceed with the transaction."
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
      console.log("👤 Connected account:", fromAddress);

      // Prepare transaction parameters
      const transactionParams = {
        from: fromAddress,
        to: qrData.to,
        value: qrData.value === "0" ? "0x0" : "0x" + qrData.value,
        data: qrData.data || "0x",
        gas: "0x15f90", // 90000 gas limit for ERC-20 transfers
      };

      console.log("🔧 Transaction params prepared:", {
        to: transactionParams.to,
        value: transactionParams.value,
        dataLength: transactionParams.data.length,
        gas: transactionParams.gas,
      });

      // Check if we need to switch networks
      const currentChainId = await window.ethereum.request({
        method: "eth_chainId",
      });
      const targetChainId = "0x" + qrData.chainId.toString(16);

      if (currentChainId !== targetChainId) {
        console.log(
          `🔄 Switching network from ${currentChainId} to ${targetChainId}`
        );
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: targetChainId }],
          });
        } catch (switchError) {
          console.warn(
            "⚠️ Network switch failed, proceeding with current network"
          );
        }
      }

      // Send transaction
      console.log("📤 Sending transaction:", transactionParams);
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParams],
      });

      console.log("✅ Transaction sent! Hash:", txHash);

      return {
        success: true,
        transactionHash: txHash,
        message: "Transaction sent successfully!",
      };
    } catch (error) {
      console.error("❌ Transaction failed:", error);

      // Provide more user-friendly error messages
      let userMessage = error.message;
      if (error.code === 4001) {
        userMessage = "Transaction was rejected by user.";
      } else if (error.code === -32000) {
        userMessage = "Insufficient funds for gas or transaction amount.";
      } else if (error.message.includes("gas")) {
        userMessage = "Transaction failed due to gas issues. Please try again.";
      } else if (error.message.includes("nonce")) {
        userMessage =
          "Transaction nonce issue. Please reset your MetaMask account or try again.";
      }

      return {
        success: false,
        error: userMessage,
      };
    }
  }
}

export const dynamicQRService = new DynamicQRService();
export default dynamicQRService;
