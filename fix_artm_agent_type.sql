-- Fix ARTM 1 agent to have correct type
-- This updates the existing ARTM agent to use the new Virtual Terminal type

UPDATE deployed_objects
SET 
  agent_type = 'Virtual Terminal',
  object_type = 'virtual_terminal'
WHERE name = 'ARTM 1';

-- Verify the update
SELECT 
  name,
  agent_type,
  object_type,
  bank_integrations,
  exchange_integrations
FROM deployed_objects
WHERE name = 'ARTM 1';
