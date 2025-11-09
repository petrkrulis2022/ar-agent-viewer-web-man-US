-- Fix Hedera agents to use correct USDh token address
-- The deployment_token_contract_address should match token_address for USDh

UPDATE deployed_objects
SET deployment_token_contract_address = '0x00000000000000000000000000000000006e24c7'
WHERE deployment_network_name = 'Hedera Testnet'
  AND token_symbol = 'USDh';

-- Verify the update
SELECT 
  name,
  deployment_network_name,
  token_symbol,
  token_address,
  deployment_token_contract_address,
  CASE 
    WHEN token_address = deployment_token_contract_address THEN '✅ MATCH'
    ELSE '❌ MISMATCH'
  END as status
FROM deployed_objects
WHERE deployment_network_name = 'Hedera Testnet';
