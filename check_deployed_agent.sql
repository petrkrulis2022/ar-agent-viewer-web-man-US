SELECT 
  id,
  name,
  positioning_mode,
  screen_position_x,
  screen_position_y,
  latitude,
  longitude
FROM deployed_objects
ORDER BY created_at DESC
LIMIT 5;
