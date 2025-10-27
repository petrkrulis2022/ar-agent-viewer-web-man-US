-- SQL Queries to investigate the new Debug agent - CORRECTED SCHEMA

-- 1. Simple query for your new Debug agent
SELECT 
    name,
    chain_id,
    network,
    interaction_fee_amount,
    interaction_fee_token,
    interaction_fee_usdfc,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%Debug%'
ORDER BY created_at DESC;

-- 2. Show fee discrepancy analysis for all cube agents
SELECT 
    name,
    interaction_fee_amount,
    interaction_fee_usdfc,
    (interaction_fee_amount - interaction_fee_usdfc) as fee_difference,
    CASE 
        WHEN interaction_fee_amount = interaction_fee_usdfc THEN '✅ CONSISTENT'
        WHEN interaction_fee_amount != interaction_fee_usdfc THEN '❌ DISCREPANCY'
        ELSE '⚠️ UNCLEAR'
    END as consistency_status
FROM deployed_objects 
WHERE name ILIKE '%cube%' OR name ILIKE '%debug%'
ORDER BY created_at DESC;

-- 3. Full Debug agent details
SELECT 
    id,
    name,
    chain_id,
    deployment_chain_id,
    network,
    deployment_network_name,
    interaction_fee_amount,
    interaction_fee_token,
    interaction_fee_usdfc,
    interaction_fee,
    agent_wallet_address,
    payment_recipient_address,
    deployer_address,
    currency_type,
    token_address,
    token_symbol,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%Debug%' 
   OR name ILIKE '%0xD7%'
   OR agent_wallet_address ILIKE '%0xD7%'
   OR deployer_address ILIKE '%0xD7%'
ORDER BY created_at DESC;
