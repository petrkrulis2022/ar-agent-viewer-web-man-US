-- Simple query to find your Debug agent
SELECT 
    id,
    name,
    chain_id,
    deployment_chain_id,
    interaction_fee_amount,
    interaction_fee_usdfc,
    fee_usdc,
    network,
    deployment_network_name,
    created_at
FROM deployed_objects 
WHERE name ILIKE '%Debug%' 
ORDER BY created_at DESC
LIMIT 5;
