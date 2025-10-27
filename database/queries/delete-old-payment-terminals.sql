-- Delete Old Payment Terminals (Keep only Payment Terminal - Peter - Sepolia)
-- Date: October 24, 2025
-- Branch: revolut-qr-payments-sim-dynamimic-online-payments
-- 
-- Reason: Old payment terminals were deployed with fixed fees.
-- New payment terminals should use dynamic amounts from merchants.
-- 
-- Wallet to keep: 0x6ef27e391c7eac228c26300aa92187382cc7ff8a
-- Agent to keep: Payment Terminal - Peter - Sepolia (ID: fbf6d253-2b63-42e5-b56f-d534e7b353eb)
--
-- Agents to DELETE:
-- 1. Revolut 2 - Base (ID: 5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d)
-- 2. Debug - Fuji - 0x..fF8a - 22 USDC (ID: c8a4292e-2710-4eee-8dd4-b4d3b8896c0b)

-- First, let's verify what we're about to delete
SELECT 
    id,
    name,
    agent_type,
    agent_wallet_address,
    owner_wallet,
    interaction_fee_amount,
    blockchain_network
FROM agents 
WHERE agent_type IN ('payment_terminal', 'Trailing Payment Terminal')
  AND agent_wallet_address = '0x6ef27e391c7eac228c26300aa92187382cc7ff8a'
ORDER BY name;

-- Show what will be deleted (for confirmation)
SELECT 
    id,
    name,
    agent_type,
    agent_wallet_address,
    interaction_fee_amount,
    blockchain_network
FROM agents 
WHERE id IN (
    '5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d',  -- Revolut 2 - Base
    'c8a4292e-2710-4eee-8dd4-b4d3b8896c0b'   -- Debug - Fuji
);

-- DELETE the old payment terminals with fixed fees
-- Uncomment the following lines to execute the deletion:

-- DELETE FROM agents 
-- WHERE id IN (
--     '5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d',  -- Revolut 2 - Base
--     'c8a4292e-2710-4eee-8dd4-b4d3b8896c0b'   -- Debug - Fuji - 0x..fF8a - 22 USDC
-- );

-- Verify deletion (should return 1 payment terminal remaining)
-- SELECT 
--     id,
--     name,
--     agent_type,
--     agent_wallet_address,
--     interaction_fee_amount,
--     blockchain_network
-- FROM agents 
-- WHERE agent_type IN ('payment_terminal', 'Trailing Payment Terminal')
--   AND agent_wallet_address = '0x6ef27e391c7eac228c26300aa92187382cc7ff8a';
