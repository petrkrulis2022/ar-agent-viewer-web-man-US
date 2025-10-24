-- ============================================
-- DELETE OLD PAYMENT TERMINALS
-- Date: October 24, 2025
-- ============================================

-- STEP 1: Verify all payment terminals for wallet 0x6ef27E391c7eac228c26300aA92187382cc7fF8a
SELECT 
    id,
    name,
    object_type,
    interaction_fee,
    token
FROM deployed_objects 
WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
  AND LOWER(agent_wallet_address) = LOWER('0x6ef27E391c7eac228c26300aA92187382cc7fF8a')
ORDER BY name;


-- STEP 2: Show what will be DELETED (2 agents)
SELECT 
    id,
    name,
    object_type,
    interaction_fee,
    token
FROM deployed_objects 
WHERE id IN (
    '5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d',
    'c8a4292e-2710-4eee-8dd4-b4d3b8896c0b'
);


-- STEP 3: Show what will be KEPT (1 agent)
SELECT 
    id,
    name,
    object_type,
    interaction_fee,
    token
FROM deployed_objects 
WHERE id = 'fbf6d253-2b63-42e5-b56f-d534e7b353eb';


-- STEP 4: DELETE the old payment terminals (UNCOMMENT TO EXECUTE)
-- DELETE FROM deployed_objects 
-- WHERE id IN (
--     '5b97ec1f-93ed-4ae6-b0fb-9496d1815c7d',
--     'c8a4292e-2710-4eee-8dd4-b4d3b8896c0b'
-- );


-- STEP 5: Verify after deletion (should show only 1 payment terminal)
-- SELECT 
--     id,
--     name,
--     object_type,
--     interaction_fee,
--     token
-- FROM deployed_objects 
-- WHERE object_type IN ('payment_terminal', 'trailing_payment_terminal')
--   AND LOWER(agent_wallet_address) = LOWER('0x6ef27E391c7eac228c26300aA92187382cc7fF8a');
