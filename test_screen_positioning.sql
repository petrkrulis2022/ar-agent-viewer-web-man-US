-- Test Screen Positioning Feature
-- Run this to insert test agents for both positioning modes

-- Test Agent 1: Screen-positioned (Top-Right Corner)
INSERT INTO deployed_objects (
  name,
  description,
  agent_type,
  user_id,
  latitude,
  longitude,
  altitude,
  positioning_mode,
  screen_position_x,
  screen_position_y,
  is_active,
  interaction_fee,
  token_symbol,
  chain_id
) VALUES (
  '📺 Screen Test Agent (Top-Right)',
  'This agent appears in the top-right corner of your screen, regardless of your GPS location. Perfect for UI overlays!',
  'intelligent_assistant',
  'test-screen-user',
  50.6474,  -- Fallback GPS (Czech Republic)
  13.8355,  -- Fallback GPS
  52.0,
  'screen',  -- Screen positioning mode
  85.0,      -- 85% from left edge
  15.0,      -- 15% from top edge
  true,
  1.0,
  'USDT',
  '2810'
);

-- Test Agent 2: Screen-positioned (Center)
INSERT INTO deployed_objects (
  name,
  description,
  agent_type,
  user_id,
  latitude,
  longitude,
  altitude,
  positioning_mode,
  screen_position_x,
  screen_position_y,
  is_active,
  interaction_fee,
  token_symbol,
  chain_id
) VALUES (
  '📺 Screen Test Agent (Center)',
  'This agent stays perfectly centered on your screen at all times. Great for welcome messages!',
  'content_creator',
  'test-screen-user',
  50.6474,
  13.8355,
  52.0,
  'screen',
  50.0,      -- 50% from left (center)
  50.0,      -- 50% from top (center)
  true,
  1.0,
  'USDT',
  '2810'
);

-- Test Agent 3: GPS-positioned (Traditional)
INSERT INTO deployed_objects (
  name,
  description,
  agent_type,
  user_id,
  latitude,
  longitude,
  altitude,
  positioning_mode,
  is_active,
  interaction_fee,
  token_symbol,
  chain_id
) VALUES (
  '🌍 GPS Test Agent (Traditional)',
  'This agent uses real GPS coordinates and appears based on your physical location. This is the original behavior.',
  'local_services',
  'test-gps-user',
  50.6480,   -- Slightly different GPS
  13.8360,   -- Slightly different GPS
  52.0,
  'gps',     -- GPS positioning mode (or can be NULL, defaults to 'gps')
  true,
  1.0,
  'USDT',
  '2810'
);

-- Test Agent 4: Screen-positioned (Bottom-Left)
INSERT INTO deployed_objects (
  name,
  description,
  agent_type,
  user_id,
  latitude,
  longitude,
  altitude,
  positioning_mode,
  screen_position_x,
  screen_position_y,
  is_active,
  interaction_fee,
  token_symbol,
  chain_id
) VALUES (
  '📺 Screen Test Agent (Bottom-Left)',
  'This agent appears in the bottom-left corner. Perfect for chat interfaces or navigation!',
  'customer_support',
  'test-screen-user',
  50.6474,
  13.8355,
  52.0,
  'screen',
  10.0,      -- 10% from left
  90.0,      -- 90% from top (near bottom)
  true,
  1.0,
  'USDT',
  '2810'
);

-- Verify the test agents were created
SELECT 
  name,
  positioning_mode,
  screen_position_x,
  screen_position_y,
  latitude,
  longitude,
  is_active
FROM deployed_objects
WHERE name LIKE '%Test Agent%'
ORDER BY positioning_mode, name;

-- Expected output:
-- name                                    | positioning_mode | screen_position_x | screen_position_y | latitude | longitude | is_active
-- ----------------------------------------+------------------+-------------------+-------------------+----------+-----------+-----------
-- 🌍 GPS Test Agent (Traditional)         | gps              | NULL              | NULL              | 50.6480  | 13.8360   | true
-- 📺 Screen Test Agent (Bottom-Left)      | screen           | 10.0              | 90.0              | 50.6474  | 13.8355   | true
-- 📺 Screen Test Agent (Center)           | screen           | 50.0              | 50.0              | 50.6474  | 13.8355   | true
-- 📺 Screen Test Agent (Top-Right)        | screen           | 85.0              | 15.0              | 50.6474  | 13.8355   | true
