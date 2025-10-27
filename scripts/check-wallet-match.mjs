// From database query, we know:
const agents = [
  { name: "Revolut 2 - Base", wallet: "0x6ef27E391c7eac228c26300aA92187382cc7fF8a" },
  { name: "revolut 1", wallet: "0x6ef27E391c7eac228c26300aA92187382cc7fF8a" },
  { name: "Cube Sepolia 4 dev account", wallet: "0x6ef27E391c7eac228c26300aA92187382cc7fF8a" },
];

// User's connected wallet (from screenshot)
const userWallet = "0x6ef27E391c7eac228c26300aA92187382cc7fF8a";

console.log("🔍 Wallet Match Check:\n");
console.log(`User Wallet: ${userWallet.toLowerCase()}`);
console.log(`\nAgents with matching wallet:`);

agents.forEach(agent => {
  const match = agent.wallet.toLowerCase() === userWallet.toLowerCase();
  console.log(`  ${match ? '✅' : '❌'} ${agent.name}: ${agent.wallet.toLowerCase()}`);
});

console.log(`\n📊 Should show ${agents.length} agents when "My agents" filter is active`);
