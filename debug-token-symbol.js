// Debug script to test tokenSymbol logic
console.log("🧪 Testing tokenSymbol logic");

// Mock USDC_DEVNET_CONFIG
const USDC_DEVNET_CONFIG = {
  mintAddress: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
};

// Test scenarios
const testCases = [
  {
    name: "USDC Payment",
    tokenMint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
    expected: "USDC",
  },
  {
    name: "Other Token Payment",
    tokenMint: "So11111111111111111111111111111111111111112",
    expected: "Token",
  },
  {
    name: "SOL Payment",
    tokenMint: null,
    expected: "SOL",
  },
];

testCases.forEach((testCase) => {
  console.log(`\n📋 Testing: ${testCase.name}`);
  console.log(`Token Mint: ${testCase.tokenMint}`);

  const tokenSymbol = testCase.tokenMint
    ? testCase.tokenMint === USDC_DEVNET_CONFIG.mintAddress
      ? "USDC"
      : "Token"
    : "SOL";

  console.log(`Expected: ${testCase.expected}`);
  console.log(`Actual: ${tokenSymbol}`);
  console.log(`Match: ${tokenSymbol === testCase.expected ? "✅" : "❌"}`);
});
