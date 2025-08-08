-- SUPABASE SQL QUERIES TO ANALYZE AGENT FILTER FIELDS
-- Run these queries in your Supabase SQL Editor to check database structure
-- Based on the NeAR Agents Marketplace screenshot filters

-- =================================================================
-- QUERY 1: Check if agent type fields exist and their values
-- =================================================================
SELECT 
  'agent_type' as field_name,
  agent_type as field_value,
  COUNT(*) as count
FROM deployed_objects 
WHERE agent_type IS NOT NULL
GROUP BY agent_type
ORDER BY count DESC;

-- =================================================================
-- QUERY 2: Check object_type field values
-- =================================================================
SELECT 
  'object_type' as field_name,
  object_type as field_value,
  COUNT(*) as count
FROM deployed_objects 
WHERE object_type IS NOT NULL
GROUP BY object_type
ORDER BY count DESC;

-- =================================================================
-- QUERY 3: Search for specific agent categories from the screenshot
-- =================================================================
-- Based on screenshot filters: Intelligent Assistant, Local Services, Payment Terminal, etc.

SELECT 
  id,
  name,
  agent_type,
  object_type,
  description,
  CASE 
    -- Intelligent Assistant category
    WHEN LOWER(agent_type) LIKE '%intelligent%' OR 
         LOWER(agent_type) LIKE '%assistant%' OR
         LOWER(object_type) LIKE '%intelligent%' OR
         LOWER(description) LIKE '%intelligent%' OR
         LOWER(description) LIKE '%assistant%' THEN 'Intelligent Assistant'
    
    -- Local Services category
    WHEN LOWER(agent_type) LIKE '%local%' OR 
         LOWER(agent_type) LIKE '%service%' OR
         LOWER(description) LIKE '%local%' OR
         LOWER(description) LIKE '%service%' THEN 'Local Services'
    
    -- Payment Terminal category  
    WHEN LOWER(agent_type) LIKE '%payment%' OR 
         LOWER(agent_type) LIKE '%terminal%' OR
         LOWER(description) LIKE '%payment%' OR
         LOWER(description) LIKE '%transaction%' THEN 'Payment Terminal'
    
    -- Game Agent category
    WHEN LOWER(agent_type) LIKE '%game%' OR 
         LOWER(description) LIKE '%game%' OR
         LOWER(description) LIKE '%entertainment%' THEN 'Game Agent'
    
    -- Tutor category
    WHEN LOWER(agent_type) LIKE '%tutor%' OR 
         LOWER(agent_type) LIKE '%teach%' OR
         LOWER(description) LIKE '%tutor%' OR
         LOWER(description) LIKE '%education%' THEN 'Tutor'
    
    -- Home Security category
    WHEN LOWER(agent_type) LIKE '%security%' OR 
         LOWER(agent_type) LIKE '%home%' OR
         LOWER(description) LIKE '%security%' THEN 'Home Security'
    
    -- Content Creator category
    WHEN LOWER(agent_type) LIKE '%content%' OR 
         LOWER(agent_type) LIKE '%creator%' OR
         LOWER(description) LIKE '%content%' OR
         LOWER(description) LIKE '%creative%' THEN 'Content Creator'
    
    -- Real Estate Broker category
    WHEN LOWER(agent_type) LIKE '%real%estate%' OR 
         LOWER(agent_type) LIKE '%broker%' OR
         LOWER(description) LIKE '%real%estate%' OR
         LOWER(description) LIKE '%property%' THEN 'Real Estate Broker'
    
    -- Bus Stop Agent category
    WHEN LOWER(agent_type) LIKE '%bus%' OR 
         LOWER(agent_type) LIKE '%transport%' OR
         LOWER(description) LIKE '%bus%' OR
         LOWER(description) LIKE '%transport%' THEN 'Bus Stop Agent'
    
    -- Study Buddy category
    WHEN LOWER(agent_type) LIKE '%study%' OR 
         LOWER(agent_type) LIKE '%buddy%' OR
         LOWER(description) LIKE '%study%' THEN 'Study Buddy'
    
    -- Landmark category
    WHEN LOWER(agent_type) LIKE '%landmark%' OR 
         LOWER(description) LIKE '%landmark%' OR
         LOWER(description) LIKE '%monument%' THEN 'Landmark'
    
    -- Building category
    WHEN LOWER(agent_type) LIKE '%building%' OR 
         LOWER(object_type) LIKE '%building%' OR
         LOWER(description) LIKE '%building%' THEN 'Building'
    
    ELSE 'Other'
  END as suggested_category,
  latitude,
  longitude,
  created_at
FROM deployed_objects 
ORDER BY suggested_category, name;

-- =================================================================
-- QUERY 4: Check for specific filter-related fields
-- =================================================================
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
  AND column_name IN (
    'agent_type',
    'object_type', 
    'category',
    'service_type',
    'agent_category',
    'classification',
    'type',
    'kind',
    'role'
  )
ORDER BY column_name;

-- =================================================================
-- QUERY 5: Sample agents with their current categorization
-- =================================================================
SELECT 
  id,
  name,
  agent_type,
  object_type,
  description,
  SUBSTRING(description, 1, 100) as short_description,
  latitude,
  longitude,
  created_at
FROM deployed_objects 
ORDER BY created_at DESC
LIMIT 20;

-- =================================================================
-- QUERY 6: Count agents by potential categories (for filter counts)
-- =================================================================
WITH categorized_agents AS (
  SELECT 
    CASE 
      WHEN LOWER(agent_type) LIKE '%intelligent%' OR 
           LOWER(agent_type) LIKE '%assistant%' OR
           LOWER(description) LIKE '%intelligent%' OR
           LOWER(description) LIKE '%assistant%' THEN 'Intelligent Assistant'
      
      WHEN LOWER(agent_type) LIKE '%local%' OR 
           LOWER(agent_type) LIKE '%service%' OR
           LOWER(description) LIKE '%local%' OR
           LOWER(description) LIKE '%service%' THEN 'Local Services'
      
      WHEN LOWER(agent_type) LIKE '%payment%' OR 
           LOWER(agent_type) LIKE '%terminal%' OR
           LOWER(description) LIKE '%payment%' THEN 'Payment Terminal'
      
      WHEN LOWER(agent_type) LIKE '%game%' OR 
           LOWER(description) LIKE '%game%' THEN 'Game Agent'
      
      WHEN LOWER(agent_type) LIKE '%tutor%' OR 
           LOWER(description) LIKE '%tutor%' OR
           LOWER(description) LIKE '%education%' THEN 'Tutor'
      
      WHEN LOWER(agent_type) LIKE '%security%' OR 
           LOWER(description) LIKE '%security%' THEN 'Home Security'
      
      WHEN LOWER(agent_type) LIKE '%content%' OR 
           LOWER(description) LIKE '%content%' THEN 'Content Creator'
      
      WHEN LOWER(agent_type) LIKE '%real%estate%' OR 
           LOWER(description) LIKE '%real%estate%' THEN 'Real Estate Broker'
      
      WHEN LOWER(agent_type) LIKE '%bus%' OR 
           LOWER(description) LIKE '%bus%' THEN 'Bus Stop Agent'
      
      WHEN LOWER(agent_type) LIKE '%study%' OR 
           LOWER(description) LIKE '%study%' THEN 'Study Buddy'
      
      WHEN LOWER(agent_type) LIKE '%landmark%' OR 
           LOWER(description) LIKE '%landmark%' THEN 'Landmark'
      
      WHEN LOWER(agent_type) LIKE '%building%' OR 
           LOWER(description) LIKE '%building%' THEN 'Building'
      
      ELSE 'Other/Uncategorized'
    END as category
  FROM deployed_objects
)
SELECT 
  category,
  COUNT(*) as agent_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM categorized_agents
GROUP BY category
ORDER BY agent_count DESC;

-- =================================================================
-- QUERY 7: Check for any existing category or classification fields
-- =================================================================
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'deployed_objects' 
  AND (
    column_name LIKE '%category%' OR
    column_name LIKE '%type%' OR
    column_name LIKE '%class%' OR
    column_name LIKE '%kind%' OR
    column_name LIKE '%tag%'
  )
ORDER BY column_name;

-- =================================================================
-- QUERY 8: Suggested filter mapping based on current data
-- =================================================================
-- This shows how current agents could map to the screenshot filters

SELECT 
  'FILTER MAPPING SUGGESTIONS' as analysis_type,
  '=========================' as separator;

SELECT 
  'Current agent_type values:' as info,
  agent_type,
  COUNT(*) as count,
  'Suggested filter category: ' || 
  CASE 
    WHEN agent_type = 'ai_agent' THEN 'Intelligent Assistant (0)'
    WHEN LOWER(agent_type) LIKE '%game%' THEN 'Game Agent (0)'
    WHEN LOWER(agent_type) LIKE '%service%' THEN 'Local Services (0)'
    WHEN LOWER(agent_type) LIKE '%payment%' THEN 'Payment Terminal (0)'
    WHEN LOWER(agent_type) LIKE '%security%' THEN 'Home Security (0)'
    ELSE 'Other category'
  END as suggested_mapping
FROM deployed_objects 
WHERE agent_type IS NOT NULL
GROUP BY agent_type
ORDER BY count DESC;

-- =================================================================
-- INSTRUCTIONS FOR SUPABASE SQL EDITOR:
-- =================================================================
-- 1. Copy and paste each query section individually into Supabase SQL Editor
-- 2. Run them one by one to see results
-- 3. The results will show:
--    - What agent_type and object_type values currently exist
--    - How current agents could be categorized for filters
--    - Missing fields that might be needed for proper filtering
--    - Suggestions for implementing the filter system from screenshot

-- =================================================================
-- BONUS: Create a view for easy filtering (optional)
-- =================================================================
-- Uncomment and run this if you want to create a categorized view:

/*
CREATE OR REPLACE VIEW agent_categories AS
SELECT 
  *,
  CASE 
    WHEN LOWER(agent_type) LIKE '%intelligent%' OR 
         LOWER(description) LIKE '%intelligent%' OR
         LOWER(description) LIKE '%assistant%' THEN 'Intelligent Assistant'
    WHEN LOWER(description) LIKE '%local%' OR
         LOWER(description) LIKE '%service%' THEN 'Local Services'
    WHEN LOWER(description) LIKE '%payment%' OR
         LOWER(description) LIKE '%terminal%' THEN 'Payment Terminal'
    WHEN LOWER(description) LIKE '%game%' THEN 'Game Agent'
    WHEN LOWER(description) LIKE '%tutor%' OR
         LOWER(description) LIKE '%education%' THEN 'Tutor'
    WHEN LOWER(description) LIKE '%security%' THEN 'Home Security'
    WHEN LOWER(description) LIKE '%content%' THEN 'Content Creator'
    WHEN LOWER(description) LIKE '%real%estate%' THEN 'Real Estate Broker'
    WHEN LOWER(description) LIKE '%bus%' OR
         LOWER(description) LIKE '%transport%' THEN 'Bus Stop Agent'
    WHEN LOWER(description) LIKE '%study%' THEN 'Study Buddy'
    WHEN LOWER(description) LIKE '%landmark%' THEN 'Landmark'
    WHEN LOWER(description) LIKE '%building%' THEN 'Building'
    ELSE 'Other'
  END as filter_category
FROM deployed_objects;
*/
