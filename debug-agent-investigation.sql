-- SQL Queries to investigate the new Debug agent and fee discrepancies
-- CORRECTED: Table name is "deployed_objects" not "agents"

-- 1. Find the new Debug agent with all fee fields
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
    fee_usdc,
    fee_usdt,
    interaction_fee,
    wallet_address,
    agent_wallet_address,
    payment_recipient_address,
    deployer_address,
    currency_type,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%Debug%' 
   OR name ILIKE '%0xD7%'
   OR wallet_address ILIKE '%0xD7%'
   OR agent_wallet_address ILIKE '%0xD7%'
   OR deployer_address ILIKE '%0xD7%'
ORDER BY created_at DESC;

-- 2. Show all agents with fee comparison
SELECT 
    id,
    name,
    chain_id,
    deployment_chain_id,
    interaction_fee_amount,
    interaction_fee_usdfc,
    fee_usdc,
    CASE 
        WHEN interaction_fee_amount IS NOT NULL AND interaction_fee_amount > 0 
        THEN 'interaction_fee_amount: ' || interaction_fee_amount
        WHEN fee_usdc IS NOT NULL AND fee_usdc > 0 
        THEN 'fee_usdc: ' || fee_usdc
        WHEN interaction_fee_usdfc IS NOT NULL AND interaction_fee_usdfc > 0 
        THEN 'interaction_fee_usdfc: ' || interaction_fee_usdfc
        ELSE 'No fee found'
    END as priority_fee,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%cube%' OR name ILIKE '%debug%'
ORDER BY created_at DESC;

-- 3. Check for Cube Dynamic 1 specifically
SELECT 
    id,
    name,
    chain_id,
    deployment_chain_id,
    network,
    deployment_network_name,
    interaction_fee_amount,
    interaction_fee_usdfc,
    fee_usdc,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%cube%dynamic%' 
   OR name ILIKE '%dynamic%1%'
ORDER BY created_at DESC;

-- 4. Count all agents by name pattern
SELECT 
    COUNT(*) as total_agents,
    COUNT(CASE WHEN name ILIKE '%cube%' THEN 1 END) as cube_agents,
    COUNT(CASE WHEN name ILIKE '%debug%' THEN 1 END) as debug_agents,
    COUNT(CASE WHEN name ILIKE '%dynamic%' THEN 1 END) as dynamic_agents
FROM deployed_objects;

-- 5. Show recent deployments (last 24 hours)
SELECT 
    id,
    name,
    chain_id,
    deployment_chain_id,
    interaction_fee_amount,
    wallet_address,
    created_at
FROM deployed_objects 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
