// Enhanced Payment Processing System for AR QR Codes
// Handles tap-to-pay functionality with comprehensive error handling

import { supabase } from "../lib/supabase";
import qrCodeService from "./qrCodeService";

// Payment processor for QR codes
export class PaymentProcessor {
  constructor() {
    this.isProcessing = false;
    this.walletConnected = false;
    this.currentNetwork = null;
  }

  // Main payment processing function
  async processQRPayment(qrData) {
    if (this.isProcessing) {
      throw new Error("Payment already in progress");
    }

    this.isProcessing = true;
    console.log("💳 Starting payment processing for QR:", qrData);

    try {
      // 1. Validate QR data
      this.validatePaymentData(qrData);

      // 2. Parse payment URI
      const paymentDetails = this.parsePaymentURI(
        qrData.payment_uri || qrData.data
      );

      // 3. Check wallet connection
      await this.ensureWalletConnection();

      // 4. Switch to correct network if needed
      await this.switchToNetwork(paymentDetails.chainId);

      // 5. Prepare and execute transaction
      const txResult = await this.executeTransaction(paymentDetails);

      // 6. Update QR status in database
      await this.updateQRStatus(qrData.id, "scanned", txResult.txHash);

      // 7. Show success message
      this.showPaymentSuccess(txResult);

      return { success: true, ...txResult };
    } catch (error) {
      console.error("💥 Payment processing failed:", error);

      // Update QR status to failed
      await this.updateQRStatus(qrData.id, "failed", null, error.message);

      // Show error message
      this.showPaymentError(error);

      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  // Validate payment data
  validatePaymentData(qrData) {
    if (!qrData) {
      throw new Error("No QR data provided");
    }

    const paymentUri = qrData.payment_uri || qrData.data;
    if (!paymentUri) {
      throw new Error("No payment URI found in QR data");
    }

    // Check if it's a valid EIP-681 URI
    if (!paymentUri.startsWith("ethereum:")) {
      throw new Error("Invalid payment URI format");
    }

    console.log("✅ Payment data validation passed");
  }

  // Parse EIP-681 payment URI
  parsePaymentURI(paymentUri) {
    console.log("🔍 Parsing payment URI:", paymentUri);

    try {
      // Parse EIP-681 format: ethereum:contractAddress@chainId/method?params
      const uriParts = paymentUri.replace("ethereum:", "").split("@");
      const contractAddress = uriParts[0];

      if (uriParts.length < 2) {
        throw new Error("Invalid URI format - missing chain ID");
      }

      const [chainId, methodAndParams] = uriParts[1].split("/");

      if (!methodAndParams) {
        throw new Error("Invalid URI format - missing method");
      }

      const [method, paramString] = methodAndParams.split("?");

      if (!paramString) {
        throw new Error("Invalid URI format - missing parameters");
      }

      // Parse parameters
      const params = new URLSearchParams(paramString);
      const recipientAddress = params.get("address");
      const amount = params.get("uint256");

      if (!recipientAddress || !amount) {
        throw new Error("Missing required parameters: address and amount");
      }

      const parsedData = {
        contractAddress,
        chainId: parseInt(chainId),
        method,
        recipientAddress,
        amount: parseInt(amount),
        rawAmount: amount,
      };

      console.log("✅ Payment URI parsed successfully:", parsedData);
      return parsedData;
    } catch (error) {
      console.error("❌ Failed to parse payment URI:", error);
      throw new Error(`Payment URI parsing failed: ${error.message}`);
    }
  }

  // Ensure wallet is connected
  async ensureWalletConnection() {
    if (!window.ethereum) {
      throw new Error(
        "MetaMask not found. Please install MetaMask to continue."
      );
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error(
          "No wallet accounts found. Please connect your wallet."
        );
      }

      this.walletConnected = true;
      console.log("✅ Wallet connected:", accounts[0]);
      return accounts[0];
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("Wallet connection was rejected by user");
      }
      throw new Error(`Wallet connection failed: ${error.message}`);
    }
  }

  // Switch to correct network
  async switchToNetwork(chainId) {
    const networkConfigs = {
      1043: {
        chainId: "0x413", // 1043 in hex
        chainName: "BlockDAG Primordial Testnet",
        rpcUrls: ["https://testnet-rpc.primordial.network"],
        nativeCurrency: { name: "BlockDAG", symbol: "BDAG", decimals: 18 },
        blockExplorerUrls: ["https://test-explorer.primordial.bdagscan.com/"],
      },
      2810: {
        chainId: "0xAFA", // 2810 in hex
        chainName: "Morph Holesky Testnet",
        rpcUrls: ["https://rpc-quicknode-holesky.morphl2.io"],
        nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
        blockExplorerUrls: ["https://explorer-holesky.morphl2.io"],
      },
      // Add more networks as needed
    };

    const config = networkConfigs[chainId];
    if (!config) {
      throw new Error(`Unsupported network: ${chainId}`);
    }

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: config.chainId }],
      });

      this.currentNetwork = chainId;
      console.log(`✅ Switched to network: ${config.chainName}`);
    } catch (switchError) {
      // Network not added, try to add it
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [config],
          });
          this.currentNetwork = chainId;
          console.log(`✅ Added and switched to network: ${config.chainName}`);
        } catch (addError) {
          throw new Error(`Failed to add network: ${addError.message}`);
        }
      } else {
        throw new Error(`Failed to switch network: ${switchError.message}`);
      }
    }
  }

  // Execute the blockchain transaction
  async executeTransaction(paymentDetails) {
    console.log("🚀 Executing transaction:", paymentDetails);

    try {
      // Prepare transaction parameters for ERC-20 token transfer
      const transactionParams = {
        to: paymentDetails.contractAddress,
        from: (await window.ethereum.request({ method: "eth_accounts" }))[0],
        data: this.encodeTransferData(
          paymentDetails.recipientAddress,
          paymentDetails.amount
        ),
        gas: "0x15F90", // 90000 gas for token transfer
        gasPrice: await this.getGasPrice(),
      };

      console.log("📝 Transaction params:", transactionParams);

      // Request transaction from user
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParams],
      });

      console.log("✅ Transaction sent:", txHash);

      // Wait for transaction confirmation (optional)
      const receipt = await this.waitForTransactionReceipt(txHash);

      return {
        txHash,
        receipt,
        amount: paymentDetails.amount,
        recipient: paymentDetails.recipientAddress,
        networkChainId: paymentDetails.chainId,
      };
    } catch (error) {
      if (error.code === 4001) {
        throw new Error("Transaction was rejected by user");
      } else if (error.code === -32603) {
        throw new Error("Insufficient funds for transaction");
      }
      throw new Error(`Transaction failed: ${error.message}`);
    }
  }

  // Encode ERC-20 transfer function data
  encodeTransferData(toAddress, amount) {
    // ERC-20 transfer function signature: transfer(address,uint256)
    const functionSignature = "0xa9059cbb";

    // Pad address to 32 bytes (remove 0x and pad to 64 chars)
    const paddedAddress = toAddress.slice(2).padStart(64, "0");

    // Pad amount to 32 bytes
    const paddedAmount = amount.toString(16).padStart(64, "0");

    return functionSignature + paddedAddress + paddedAmount;
  }

  // Get current gas price
  async getGasPrice() {
    try {
      const gasPrice = await window.ethereum.request({
        method: "eth_gasPrice",
      });
      return gasPrice;
    } catch (error) {
      console.warn("Failed to get gas price, using default");
      return "0x9502F9000"; // 40 gwei default
    }
  }

  // Wait for transaction receipt
  async waitForTransactionReceipt(txHash, maxWait = 60000) {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      try {
        const receipt = await window.ethereum.request({
          method: "eth_getTransactionReceipt",
          params: [txHash],
        });

        if (receipt) {
          console.log("✅ Transaction confirmed:", receipt);
          return receipt;
        }
      } catch (error) {
        console.warn("Error checking transaction receipt:", error);
      }

      // Wait 2 seconds before checking again
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    console.warn("Transaction receipt not found within timeout");
    return null;
  }

  // Update QR status in database
  async updateQRStatus(qrId, status, txHash = null, errorMessage = null) {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (status === "scanned" && txHash) {
        updateData.scanned_at = new Date().toISOString();
        updateData.transaction_hash = txHash;
      }

      if (status === "failed" && errorMessage) {
        updateData.error_message = errorMessage;
      }

      await qrCodeService.updateQRCodeStatus(qrId, status, updateData);
      console.log("✅ QR status updated in database");
    } catch (error) {
      console.warn("Failed to update QR status in database:", error);
    }
  }

  // Show payment success message
  showPaymentSuccess(txResult) {
    const message = `Payment successful! Transaction: ${txResult.txHash.slice(
      0,
      10
    )}...`;

    if (window.showNotification) {
      window.showNotification({
        type: "success",
        title: "Payment Completed",
        message: message,
        duration: 5000,
        action: {
          label: "View Transaction",
          onClick: () =>
            this.openTransactionExplorer(
              txResult.txHash,
              txResult.networkChainId
            ),
        },
      });
    } else {
      alert(message);
    }

    console.log("✅ Payment success notification shown");
  }

  // Show payment error message
  showPaymentError(error) {
    let message = "Payment failed";

    if (error.message.includes("rejected")) {
      message = "Payment cancelled by user";
    } else if (error.message.includes("insufficient")) {
      message = "Insufficient funds";
    } else if (error.message.includes("network")) {
      message = "Network error - please check connection";
    } else if (error.message.includes("MetaMask")) {
      message = "Please install MetaMask to continue";
    }

    if (window.showNotification) {
      window.showNotification({
        type: "error",
        title: "Payment Failed",
        message: message,
        duration: 7000,
      });
    } else {
      alert(`Error: ${message}`);
    }

    console.log("❌ Payment error notification shown");
  }

  // Open transaction in block explorer
  openTransactionExplorer(txHash, chainId) {
    const explorers = {
      1043: `https://test-explorer.primordial.bdagscan.com/tx/${txHash}`,
      2810: `https://explorer-holesky.morphl2.io/tx/${txHash}`,
    };

    const url = explorers[chainId];
    if (url) {
      window.open(url, "_blank");
    }
  }
}

// Global payment processor instance
const paymentProcessor = new PaymentProcessor();

// Export for use in components
export default paymentProcessor;

// Make globally available for debugging
if (typeof window !== "undefined") {
  window.paymentProcessor = paymentProcessor;
}
