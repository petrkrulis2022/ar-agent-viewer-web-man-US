/**
 * Hedera Token Payment Utilities
 *
 * NOTE: This is a simplified stub for development.
 * For production, integrate with HashPack wallet or Hedera SDK.
 */

export const transferHederaToken = async ({
  tokenId,
  recipientAccountId,
  amount,
  memo = "",
}) => {
  console.log("💸 Hedera Token Transfer Request:", {
    tokenId,
    recipientAccountId,
    amount,
    memo,
  });

  // Simulate payment delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // In development, always succeed
  const simulatedTxId = `0.0.${Date.now()}@${Math.floor(
    Date.now() / 1000
  )}.${Math.random().toString(36).substring(7)}`;

  console.log("✅ Simulated Hedera transfer successful:", simulatedTxId);

  return {
    success: true,
    transactionId: simulatedTxId,
    amount,
    recipient: recipientAccountId,
    memo,
  };
};

export const getHederaAccountBalance = async (accountId) => {
  console.log("🔍 Checking Hedera account balance:", accountId);

  // Return mock balance
  return {
    success: true,
    balance: 10000, // 10,000 USDH
    accountId,
  };
};

export default {
  transferHederaToken,
  getHederaAccountBalance,
};
