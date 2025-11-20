/**
 * Hedera Payment Service
 * Handles USDh multi-transfer transactions for paying multiple agents
 * Uses Hedera JS SDK for transaction construction
 */

import {
  Client,
  TransferTransaction,
  AccountId,
  Hbar,
  TokenId,
} from "@hashgraph/sdk";

// USDh token ID on Hedera testnet
const USDH_TOKEN_ID = "0.0.7218375";

/**
 * Initialize Hedera client for testnet
 * @returns {Client} Hedera client
 */
function initHederaClient() {
  const client = Client.forTestnet();
  return client;
}

/**
 * Create a multi-transfer transaction to pay multiple agents
 * @param {Array} costBreakdown - Array of payment items
 * Example: [
 *   { agent: 'Bus Agent', accountId: '0.0.12345', amount: 5.5 },
 *   { agent: 'Train Agent', accountId: '0.0.67890', amount: 10.0 }
 * ]
 * @param {string} userAccountId - User's Hedera account ID
 * @returns {TransferTransaction} - Unsigned transaction
 */
export function createMultiTransferTransaction(costBreakdown, userAccountId) {
  const transaction = new TransferTransaction();

  const tokenId = TokenId.fromString(USDH_TOKEN_ID);
  const userAccount = AccountId.fromString(userAccountId);

  // Calculate total amount
  let totalAmount = 0;

  for (const item of costBreakdown) {
    const agentAccount = AccountId.fromString(item.accountId);
    const amount = Math.floor(item.amount * 100); // Convert to smallest unit (assuming 2 decimals)

    // Credit to agent
    transaction.addTokenTransfer(tokenId, agentAccount, amount);
    totalAmount += amount;
  }

  // Debit from user (total amount)
  transaction.addTokenTransfer(tokenId, userAccount, -totalAmount);

  console.log("Created multi-transfer transaction:", {
    from: userAccountId,
    totalAmount: totalAmount / 100,
    recipients: costBreakdown.length,
  });

  return transaction;
}

/**
 * Handle payment using wallet provider (HashPack, Blade, etc.)
 * @param {Array} costBreakdown - Payment breakdown
 * @param {Object} walletProvider - Wallet provider instance
 * @returns {Promise<Object>} - Transaction result
 */
export async function handlePaymentWithWallet(costBreakdown, walletProvider) {
  try {
    if (!walletProvider || !walletProvider.accountId) {
      throw new Error("Wallet not connected");
    }

    const userAccountId = walletProvider.accountId;

    // Create transaction
    const transaction = createMultiTransferTransaction(
      costBreakdown,
      userAccountId
    );

    // Set transaction fee payer
    transaction.setTransactionMemo("AgentSphere Journey Payment");

    // Sign and execute through wallet
    console.log("Requesting wallet signature...");
    const signedTx = await walletProvider.signTransaction(transaction);

    console.log("Sending transaction...");
    const result = await walletProvider.sendTransaction(signedTx);

    console.log("Payment successful:", result);

    return {
      success: true,
      transactionId: result.transactionId?.toString(),
      receipt: result,
    };
  } catch (error) {
    console.error("Payment failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Format cost breakdown for display
 * @param {Array} costBreakdown - Payment breakdown
 * @returns {Object} - Formatted summary
 */
export function formatPaymentSummary(costBreakdown) {
  const total = costBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return {
    items: costBreakdown.map((item) => ({
      agent: item.agent,
      description: item.description || `${item.agent} service fee`,
      amount: item.amount,
      currency: "USDh",
    })),
    total,
    currency: "USDh",
    recipients: costBreakdown.length,
  };
}

/**
 * Validate cost breakdown
 * @param {Array} costBreakdown - Payment breakdown to validate
 * @returns {boolean} - True if valid
 */
export function validateCostBreakdown(costBreakdown) {
  if (!Array.isArray(costBreakdown) || costBreakdown.length === 0) {
    throw new Error("Cost breakdown must be a non-empty array");
  }

  for (const item of costBreakdown) {
    if (!item.accountId || !item.amount) {
      throw new Error("Each item must have accountId and amount");
    }

    if (item.amount <= 0) {
      throw new Error("Amount must be positive");
    }

    // Validate Hedera account ID format (0.0.xxxxx)
    if (!/^0\.0\.\d+$/.test(item.accountId)) {
      throw new Error(`Invalid Hedera account ID: ${item.accountId}`);
    }
  }

  return true;
}

/**
 * Get transaction explorer URL
 * @param {string} transactionId - Hedera transaction ID
 * @param {string} network - Network (testnet or mainnet)
 * @returns {string} - Explorer URL
 */
export function getTransactionExplorerUrl(transactionId, network = "testnet") {
  return `https://hashscan.io/${network}/transaction/${transactionId}`;
}
