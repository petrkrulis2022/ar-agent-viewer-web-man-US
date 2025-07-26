import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// Solana Testnet Configuration
const SOLANA_TESTNET_RPC = "https://api.testnet.solana.com";
const connection = new Connection(SOLANA_TESTNET_RPC, "confirmed");

// Testnet validation
export const validateTestnetConnection = async () => {
  try {
    const version = await connection.getVersion();
    console.log("✅ Solana testnet connection successful:", version);
    return true;
  } catch (error) {
    console.error("❌ Solana testnet connection failed:", error);
    return false;
  }
};

// Payment statuses
export const SOLANA_PAYMENT_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  CONFIRMED: "confirmed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

// Create Solana payment QR data
export const generateSolanaPaymentQRData = (paymentInfo) => {
  const { amount, recipient, memo } = paymentInfo;

  // Validate inputs
  console.log("🔍 Input validation for Solana QR generation:");
  console.log("- Recipient:", recipient);
  console.log("- Amount:", amount, typeof amount);
  console.log("- Memo:", memo);

  // Validate recipient address
  if (!isValidSolanaAddress(recipient)) {
    console.error("❌ Invalid Solana address:", recipient);
    throw new Error("Invalid recipient address");
  }

  // Use decimal amount (like Google example) for better wallet compatibility
  const decimalAmount = Number(amount).toFixed(1); // e.g., "1.0" instead of "1"
  console.log("- Decimal amount:", decimalAmount);

  // Create Solana Pay URL format (following Google's example format)
  // Format: solana:<recipient>?amount=<amount>&label=<label>&message=<message>
  // NOTE: No token address needed for native SOL transfers
  let qrData = `solana:${recipient}?amount=${decimalAmount}`;

  // Add label parameter (similar to Google example)
  qrData += `&label=AR Agent Payment`;

  // Add message parameter (similar to Google example)
  if (memo) {
    qrData += `&message=${encodeURIComponent(memo)}`;
  }

  console.log("✅ Generated Solana Pay QR data (native SOL):", qrData);
  console.log("📝 Format validation:");
  console.log("- Protocol: solana:");
  console.log("- Recipient address:", recipient);
  console.log("- Amount (SOL):", decimalAmount);
  console.log("- Label: AR Agent Payment");
  console.log("- Message:", memo);
  console.log("- No token address (native SOL transfer)");
  return qrData;
};

// Validate Solana address
export const isValidSolanaAddress = (address) => {
  try {
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

// Get SOL balance for an address
export const getSolanaBalance = async (publicKey) => {
  try {
    if (!publicKey) return null;

    const balance = await connection.getBalance(new PublicKey(publicKey));
    return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return null;
  }
};

// Create a basic SOL transfer transaction
export const createSolanaTransfer = async (
  fromPubkey,
  toPubkey,
  amount,
  memo = null
) => {
  try {
    const fromPublicKey = new PublicKey(fromPubkey);
    const toPublicKey = new PublicKey(toPubkey);
    const lamports = Math.floor(amount * LAMPORTS_PER_SOL);

    // Get the latest blockhash
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash();

    // Create transaction
    const transaction = new Transaction({
      feePayer: fromPublicKey,
      blockhash,
      lastValidBlockHeight,
    });

    // Add transfer instruction
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromPublicKey,
        toPubkey: toPublicKey,
        lamports,
      })
    );

    // Add memo if provided
    if (memo) {
      const memoProgram = new PublicKey(
        "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
      );
      transaction.add({
        keys: [],
        programId: memoProgram,
        data: Buffer.from(memo, "utf8"),
      });
    }

    return transaction;
  } catch (error) {
    console.error("Error creating Solana transfer:", error);
    throw error;
  }
};

// Send and confirm transaction
export const sendSolanaTransaction = async (wallet, transaction) => {
  try {
    if (!wallet || !wallet.adapter || !wallet.adapter.connected) {
      throw new Error("Wallet not connected");
    }

    // Sign the transaction
    const signedTransaction = await wallet.adapter.signTransaction(transaction);

    // Send the transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize()
    );

    console.log("Transaction sent:", signature);

    // Confirm the transaction
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.recentBlockhash,
      lastValidBlockHeight: transaction.lastValidBlockHeight,
    });

    if (confirmation.value.err) {
      throw new Error(`Transaction failed: ${confirmation.value.err}`);
    }

    console.log("Transaction confirmed:", signature);
    return {
      signature,
      status: SOLANA_PAYMENT_STATUS.CONFIRMED,
    };
  } catch (error) {
    console.error("Error sending Solana transaction:", error);
    return {
      signature: null,
      status: SOLANA_PAYMENT_STATUS.FAILED,
      error: error.message,
    };
  }
};

// Get transaction details
export const getSolanaTransaction = async (signature) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      encoding: "jsonParsed",
    });

    if (!transaction) {
      return { status: SOLANA_PAYMENT_STATUS.PENDING };
    }

    const status = transaction.meta?.err
      ? SOLANA_PAYMENT_STATUS.FAILED
      : SOLANA_PAYMENT_STATUS.CONFIRMED;

    return {
      status,
      blockTime: transaction.blockTime,
      slot: transaction.slot,
      fee: transaction.meta?.fee,
      transaction,
    };
  } catch (error) {
    console.error("Error fetching Solana transaction:", error);
    return { status: SOLANA_PAYMENT_STATUS.FAILED, error: error.message };
  }
};

// Monitor transaction status
export const monitorSolanaTransaction = async (
  signature,
  maxAttempts = 30,
  intervalMs = 2000
) => {
  let attempts = 0;

  return new Promise((resolve) => {
    const checkStatus = async () => {
      attempts++;

      try {
        const result = await getSolanaTransaction(signature);

        if (
          result.status === SOLANA_PAYMENT_STATUS.CONFIRMED ||
          result.status === SOLANA_PAYMENT_STATUS.FAILED ||
          attempts >= maxAttempts
        ) {
          resolve(result);
          return;
        }

        // Continue monitoring
        setTimeout(checkStatus, intervalMs);
      } catch (error) {
        if (attempts >= maxAttempts) {
          resolve({
            status: SOLANA_PAYMENT_STATUS.FAILED,
            error: "Monitoring timeout",
          });
        } else {
          setTimeout(checkStatus, intervalMs);
        }
      }
    };

    checkStatus();
  });
};

// Generate agent payment data for Solana
export const generateSolanaAgentPayment = (agent, amount = 1) => {
  // Use the original valid Solana testnet address - this is a proper base58 address
  const testRecipient = "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM";

  console.log("🎯 Generating Solana agent payment:");
  console.log("- Agent:", agent.name, "(ID:", agent.id + ")");
  console.log("- Test recipient address:", testRecipient);
  console.log("- Amount:", amount, "SOL");
  console.log("- Address validation:", isValidSolanaAddress(testRecipient));

  return {
    recipient: testRecipient,
    amount: amount,
    memo: `Payment to AR Agent: ${agent.name} (ID: ${agent.id})`,
    agentId: agent.id,
    agentName: agent.name,
    network: "Solana Testnet",
    currency: "SOL",
  };
}; // Parse Solana Pay QR code
export const parseSolanaPayQR = (qrData) => {
  try {
    const url = new URL(qrData);

    if (url.protocol !== "solana:") {
      throw new Error("Invalid Solana Pay URL");
    }

    const recipient = url.pathname;
    const amount = url.searchParams.get("amount");
    const memo =
      url.searchParams.get("memo") || url.searchParams.get("message");
    const label = url.searchParams.get("label");

    // Validate the parsed data
    if (!isValidSolanaAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    if (!amount || isNaN(Number(amount))) {
      throw new Error("Invalid amount");
    }

    return {
      recipient,
      amount: Number(amount), // Keep as decimal number
      memo: memo ? decodeURIComponent(memo) : null,
      label: label ? decodeURIComponent(label) : null,
      network: "testnet", // Always testnet for our use case
    };
  } catch (error) {
    console.error("Error parsing Solana Pay QR:", error);
    return null;
  }
};

// Test QR code generation and parsing
export const testSolanaPayQR = (agent) => {
  console.log("🧪 Testing Solana Pay QR generation for agent:", agent.name);
  console.log("==================================================");

  // Generate payment data
  const paymentData = generateSolanaAgentPayment(agent, 1);
  console.log("📊 Payment data:", paymentData);

  // Generate QR code
  const qrData = generateSolanaPaymentQRData(paymentData);
  console.log("📱 QR data:", qrData);

  // Parse and validate
  const parsed = parseSolanaPayQR(qrData);
  console.log("✅ Parsed QR data:", parsed);

  // Additional validation
  console.log("🔍 QR Format Validation:");
  console.log("- Starts with 'solana:':", qrData.startsWith("solana:"));
  console.log("- Contains amount parameter:", qrData.includes("amount="));
  console.log("- Contains memo parameter:", qrData.includes("memo="));
  console.log(
    "- No token address (native SOL):",
    !qrData.includes("spl-token")
  );

  // Validate against Solana Pay spec
  const isValidFormat = validateSolanaPayFormat(qrData);
  console.log("- Valid Solana Pay format:", isValidFormat);

  return {
    paymentData,
    qrData,
    parsed,
    isValid: parsed !== null,
    formatValid: isValidFormat,
  };
};

// Validate Solana Pay format
export const validateSolanaPayFormat = (qrData) => {
  try {
    // Check if it's a valid Solana Pay URL
    if (!qrData.startsWith("solana:")) {
      console.error("❌ Invalid protocol, must start with 'solana:'");
      return false;
    }

    // Parse as URL
    const url = new URL(qrData);

    // Check recipient (the pathname after 'solana:')
    const recipient = url.pathname;
    if (!isValidSolanaAddress(recipient)) {
      console.error("❌ Invalid recipient address:", recipient);
      return false;
    }

    // Check amount parameter
    const amount = url.searchParams.get("amount");
    if (!amount || isNaN(Number(amount))) {
      console.error("❌ Invalid or missing amount parameter:", amount);
      return false;
    }

    console.log("✅ Valid Solana Pay format");
    console.log("- Protocol: solana:");
    console.log("- Recipient:", recipient);
    console.log("- Amount:", amount, "SOL");
    console.log("- Type: Native SOL transfer (no token address)");

    return true;
  } catch (error) {
    console.error("❌ Solana Pay format validation error:", error);
    return false;
  }
};

// Check if an address has testnet SOL balance
export const checkTestnetBalance = async (address) => {
  try {
    const balance = await getSolanaBalance(address);
    console.log(`💰 Testnet balance for ${address}:`, balance, "SOL");
    return balance;
  } catch (error) {
    console.error("❌ Error checking testnet balance:", error);
    return null;
  }
};

// Generate a comprehensive QR test report
export const generateQRTestReport = async (agent) => {
  console.log("📊 COMPREHENSIVE SOLANA QR TEST REPORT");
  console.log("=====================================");

  // Test payment generation
  const paymentData = generateSolanaAgentPayment(agent, 1);
  const qrData = generateSolanaPaymentQRData(paymentData);

  // Test parsing
  const parsed = parseSolanaPayQR(qrData);

  // Test validation
  const isValidFormat = validateSolanaPayFormat(qrData);

  // Check recipient balance
  const recipientBalance = await checkTestnetBalance(paymentData.recipient);

  // Test example QR formats
  console.log("📱 QR Format Comparison:");
  console.log("- Our format:      ", qrData);
  console.log(
    "- Google example:  ",
    "solana:9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM?amount=0.1&label=Payment&message=AR%20Agent%20Service"
  );
  console.log(
    "- Solana Pay spec: ",
    "solana:<recipient>?amount=<amount>&label=<label>&message=<message>"
  );

  const report = {
    agent: agent.name,
    paymentData,
    qrData,
    parsed,
    isValidFormat,
    recipientBalance,
    status: isValidFormat && parsed ? "✅ VALID" : "❌ INVALID",
    recommendations: [],
  };

  // Add recommendations
  if (!isValidFormat) {
    report.recommendations.push("Fix QR format validation");
  }
  if (recipientBalance === null || recipientBalance === 0) {
    report.recommendations.push(
      "Recipient address needs testnet SOL from faucet"
    );
  }
  if (!parsed) {
    report.recommendations.push("Fix QR parsing logic");
  }

  console.log("📋 Final Report:", report);
  return report;
};

export default {
  generateSolanaPaymentQRData,
  generateSolanaAgentPayment,
  isValidSolanaAddress,
  getSolanaBalance,
  createSolanaTransfer,
  sendSolanaTransaction,
  getSolanaTransaction,
  monitorSolanaTransaction,
  parseSolanaPayQR,
  testSolanaPayQR,
  validateTestnetConnection,
  validateSolanaPayFormat,
  checkTestnetBalance,
  generateQRTestReport,
  SOLANA_PAYMENT_STATUS,
};
