-- Delete all agents from deployed_objects table
DELETE FROM deployed_objects;

-- Verify deletion
SELECT COUNT(*) as remaining_agents FROM deployed_objects;
