import { ethers } from "ethers";
import ENSService from "./ensService.js";

/**
 * ENS Payment Service for AR Viewer
 * Handles ENS domain payments with fresh resolution on each payment
 */

// Payment status constants
export const ENS_PAYMENT_STATUS = {
  PENDING: "pending",
  RESOLVING: "resolving",
  PROCESSING: "processing",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Network configurations for ENS payments
export const ENS_NETWORKS = {
  mainnet: {
    chainId: 1,
    name: "Ethereum Mainnet",
    symbol: "ETH",
    rpcUrl: "https://eth.llamarpc.com",
    explorerUrl: "https://etherscan.io",
  },
  sepolia: {
    chainId: 11155111,
    name: "Ethereum Sepolia",
    symbol: "ETH",
    rpcUrl: "https://ethereum-sepolia-rpc.publicnode.com",
    explorerUrl: "https://sepolia.etherscan.io",
  },
};

// USDC Token contract addresses by network
export const USDC_CONTRACTS = {
  mainnet: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // Official USDC on Mainnet
  sepolia: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238", // Circle's USDC on Sepolia
};

// ERC-20 Transfer function signature
const ERC20_TRANSFER_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
];

/**
 * Get connected MetaMask wallet address
 */
export const getConnectedWalletAddress = async () => {
  if (typeof window !== "undefined" && window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      return accounts[0] || null;
    } catch (error) {
      console.error("Error getting connected wallet:", error);
      return null;
    }
  }
  return null;
};

/**
 * Connect MetaMask wallet
 */
export const connectWallet = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected. Please install MetaMask.");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (error) {
    console.error("Failed to connect wallet:", error);
    throw new Error("Failed to connect MetaMask wallet");
  }
};

/**
 * Switch to correct network for ENS payment
 */
export const switchToNetwork = async (network = "sepolia") => {
  const networkConfig = ENS_NETWORKS[network];
  if (!networkConfig) {
    throw new Error(`Unsupported network: ${network}`);
  }

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  try {
    // Try to switch to the network
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${networkConfig.chainId.toString(16)}` }],
    });
    console.log(`✅ Switched to ${networkConfig.name}`);
    return true;
  } catch (switchError) {
    // Network doesn't exist, add it
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [
            {
              chainId: `0x${networkConfig.chainId.toString(16)}`,
              chainName: networkConfig.name,
              nativeCurrency: {
                name: networkConfig.symbol,
                symbol: networkConfig.symbol,
                decimals: 18,
              },
              rpcUrls: [networkConfig.rpcUrl],
              blockExplorerUrls: [networkConfig.explorerUrl],
            },
          ],
        });
        console.log(`✅ Added and switched to ${networkConfig.name}`);
        return true;
      } catch (addError) {
        console.error("Failed to add network:", addError);
        throw new Error(`Failed to add ${networkConfig.name}`);
      }
    }
    console.error("Failed to switch network:", switchError);
    throw new Error(`Failed to switch to ${networkConfig.name}`);
  }
};

/**
 * Resolve ENS domain to address (fresh resolution on each payment)
 */
export const resolveENSDomain = async (domain, network = "sepolia") => {
  console.log(`🌐 Resolving ENS domain: ${domain} on ${network}`);

  try {
    const ensService = new ENSService(network);
    const result = await ensService.resolveENS(domain);

    if (!result.success || !result.address) {
      throw new Error(result.error || "Failed to resolve ENS domain");
    }

    console.log(`✅ Resolved ${domain} → ${result.address}`);
    return {
      success: true,
      address: result.address,
      domain: domain,
      network: network,
    };
  } catch (error) {
    console.error(`❌ ENS resolution failed:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate Ethereum address
 */
export const isValidEthereumAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  const regex = /^0x[a-fA-F0-9]{40}$/;
  return regex.test(address);
};

/**
 * Generate ENS payment data for agent
 * @param {Object} agent - Agent object with ENS configuration
 * @param {Number} amount - Payment amount in ETH (default uses agent's interaction_fee)
 */
export const generateENSAgentPayment = async (agent, amount = null) => {
  console.log("🌐 Generating ENS payment for agent:", agent.name || agent.id);

  // Get ENS configuration from agent
  const ensDomain = agent.ens_domain;
  const ensNetwork = agent.ens_resolver_network || "sepolia";
  const ensResolvedAddress = agent.ens_resolved_address;

  if (!ensDomain) {
    throw new Error("Agent does not have ENS domain configured");
  }

  // Use agent's interaction fee if amount not specified
  const paymentAmount =
    amount !== null
      ? amount
      : agent.interaction_fee_amount || agent.interaction_fee || 10;

  // Get token type from agent config (default to USDC)
  const paymentToken = agent.interaction_fee_token || "USDC";

  console.log("📋 ENS Payment Config:");
  console.log("- ENS Domain:", ensDomain);
  console.log("- Network:", ensNetwork);
  console.log("- Cached Address:", ensResolvedAddress);
  console.log("- Payment Amount:", paymentAmount, paymentToken);

  // FRESH RESOLUTION: Always resolve on payment to get latest address
  console.log("🔄 Performing fresh ENS resolution...");
  const resolution = await resolveENSDomain(ensDomain, ensNetwork);

  if (!resolution.success) {
    throw new Error(
      `Failed to resolve ENS domain: ${resolution.error || "Unknown error"}`,
    );
  }

  const resolvedAddress = resolution.address;

  // Validate resolved address
  if (!isValidEthereumAddress(resolvedAddress)) {
    throw new Error(`Invalid resolved address: ${resolvedAddress}`);
  }

  const networkConfig = ENS_NETWORKS[ensNetwork];

  return {
    // ENS specific
    ensDomain: ensDomain,
    resolvedAddress: resolvedAddress,

    // Payment details
    recipient: resolvedAddress,
    amount: paymentAmount,
    currency: paymentToken,
    token: paymentToken,
    tokenContract: paymentToken === "USDC" ? USDC_CONTRACTS[ensNetwork] : null,
    isTokenPayment: paymentToken !== "ETH",

    // Network details
    network: networkConfig.name,
    networkKey: ensNetwork,
    chainId: networkConfig.chainId,

    // Agent details
    agentId: agent.id,
    agentName: agent.name || "Unknown Agent",

    // Metadata
    memo: `ENS Payment to ${ensDomain} via ${agent.name || "Agent"}`,
    timestamp: Date.now(),
  };
};

/**
 * Generate EIP-681 payment URI for ENS payment
 * For ETH: ethereum:ADDRESS@CHAIN_ID?value=AMOUNT_IN_WEI
 * For ERC-20: ethereum:TOKEN_CONTRACT@CHAIN_ID/transfer?address=RECIPIENT&uint256=AMOUNT
 */
export const generateENSPaymentQRData = (paymentInfo) => {
  const {
    resolvedAddress,
    amount,
    chainId,
    ensDomain,
    token,
    tokenContract,
    isTokenPayment,
  } = paymentInfo;

  console.log("📱 Generating ENS payment QR code:");
  console.log("- ENS Domain:", ensDomain);
  console.log("- Resolved Address:", resolvedAddress);
  console.log("- Amount:", amount, token);
  console.log("- Chain ID:", chainId);
  console.log("- Is Token Payment:", isTokenPayment);

  // Validate address
  if (!isValidEthereumAddress(resolvedAddress)) {
    throw new Error("Invalid recipient address");
  }

  let uri;

  if (isTokenPayment && tokenContract) {
    // ERC-20 token payment (USDC has 6 decimals)
    const decimals = token === "USDC" ? 6 : 18;
    const amountInSmallestUnit = ethers.utils
      .parseUnits(amount.toString(), decimals)
      .toString();

    // EIP-681 format for ERC-20 transfer
    uri = `ethereum:${tokenContract}@${chainId}/transfer?address=${resolvedAddress}&uint256=${amountInSmallestUnit}`;

    console.log("✅ Generated ERC-20 payment URI:", uri);
    console.log(
      `💰 Amount in smallest unit (${decimals} decimals):`,
      amountInSmallestUnit,
    );
  } else {
    // Native ETH payment
    const amountInWei = ethers.utils.parseEther(amount.toString()).toString();
    uri = `ethereum:${resolvedAddress}@${chainId}?value=${amountInWei}`;

    console.log("✅ Generated ETH payment URI:", uri);
    console.log("💰 Amount in Wei:", amountInWei);
  }

  return uri;
};

/**
 * Send ENS payment via MetaMask
 * Supports both native ETH and ERC-20 token transfers
 */
export const sendENSPayment = async (paymentInfo) => {
  console.log("💸 Initiating ENS payment...");

  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const {
    resolvedAddress,
    amount,
    chainId,
    ensDomain,
    token,
    tokenContract,
    isTokenPayment,
  } = paymentInfo;

  try {
    // Ensure correct network
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });
    const expectedChainId = `0x${chainId.toString(16)}`;

    if (currentChainId !== expectedChainId) {
      console.log(
        `⚠️ Wrong network. Switching from ${currentChainId} to ${expectedChainId}...`,
      );
      await switchToNetwork(paymentInfo.networkKey);
    }

    // Get connected account
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    const fromAddress = accounts[0];

    let txHash;

    if (isTokenPayment && tokenContract) {
      // ERC-20 Token Transfer (USDC)
      console.log(
        `📤 Sending ${amount} ${token} to ${resolvedAddress} via ${tokenContract}`,
      );

      const decimals = token === "USDC" ? 6 : 18;
      const amountInSmallestUnit = ethers.utils.parseUnits(
        amount.toString(),
        decimals,
      );

      // Create the ERC-20 transfer data
      const iface = new ethers.utils.Interface(ERC20_TRANSFER_ABI);
      const data = iface.encodeFunctionData("transfer", [
        resolvedAddress,
        amountInSmallestUnit,
      ]);

      const transactionParams = {
        from: fromAddress,
        to: tokenContract, // Send to token contract
        data: data, // ERC-20 transfer call
        chainId: expectedChainId,
      };

      console.log("📤 Sending ERC-20 transaction:", transactionParams);

      txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParams],
      });
    } else {
      // Native ETH Transfer
      const amountInWei = ethers.utils
        .parseEther(amount.toString())
        .toHexString();

      const transactionParams = {
        from: fromAddress,
        to: resolvedAddress,
        value: amountInWei,
        chainId: expectedChainId,
      };

      console.log("📤 Sending ETH transaction:", transactionParams);

      txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [transactionParams],
      });
    }

    console.log("✅ Transaction sent:", txHash);

    return {
      success: true,
      txHash: txHash,
      ensDomain: ensDomain,
      resolvedAddress: resolvedAddress,
      amount: amount,
      token: token,
      network: paymentInfo.network,
    };
  } catch (error) {
    console.error("❌ Payment failed:", error);

    if (error.code === 4001) {
      throw new Error("Transaction rejected by user");
    } else if (error.code === -32603) {
      throw new Error("Insufficient funds for transaction");
    }

    throw new Error(`Payment failed: ${error.message}`);
  }
};

/**
 * Check MetaMask compatibility
 */
export const checkMetaMaskCompatibility = async () => {
  if (typeof window === "undefined" || !window.ethereum) {
    return { compatible: false, reason: "MetaMask not detected" };
  }

  try {
    await window.ethereum.request({ method: "eth_accounts" });

    return {
      compatible: true,
      version: window.ethereum.version || "Unknown",
      isMetaMask: window.ethereum.isMetaMask || false,
    };
  } catch (error) {
    return {
      compatible: false,
      reason: `MetaMask error: ${error.message}`,
    };
  }
};

export default {
  generateENSAgentPayment,
  generateENSPaymentQRData,
  resolveENSDomain,
  sendENSPayment,
  connectWallet,
  switchToNetwork,
  getConnectedWalletAddress,
  isValidEthereumAddress,
  checkMetaMaskCompatibility,
  ENS_PAYMENT_STATUS,
  ENS_NETWORKS,
};
