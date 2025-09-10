-- SQL Script to Delete Cube Dynamic 1 Agent
-- Run this in Supabase SQL Editor

-- First, verify the agent exists and show its details
SELECT 
  id,
  name,
  network,
  chain_id,
  interaction_fee_amount,
  interaction_fee_token,
  contract_address,
  created_at
FROM deployed_objects 
WHERE name = 'Cube Dynamic 1'
  AND id = 'f911cc7d-244c-4916-9612-71b3904e9424';

-- If the above query shows the correct agent, uncomment the DELETE statement below:

/*
DELETE FROM deployed_objects 
WHERE name = 'Cube Dynamic 1' 
  AND id = 'f911cc7d-244c-4916-9612-71b3904e9424';
*/

-- After deletion, verify it's gone:
/*
SELECT COUNT(*) as remaining_count
FROM deployed_objects 
WHERE name ILIKE '%Cube Dynamic 1%';
*/
