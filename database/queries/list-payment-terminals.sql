-- ============================================
-- LIST ALL PAYMENT TERMINALS
-- Wallet: 0x6ef27e391c7eac228c26300aa92187382cc7ff8a
-- Date: October 24, 2025
-- ============================================

SELECT 
    id,
    name,
    object_type,
    interaction_fee,
    token,
    created_at
FROM deployed_objects 
WHERE object_type IN ('payment_terminal', 'Trailing Payment Terminal')
  AND LOWER(agent_wallet_address) = LOWER('0x6ef27e391c7eac228c26300aa92187382cc7ff8a')
ORDER BY created_at DESC;
