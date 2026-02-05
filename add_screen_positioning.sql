-- Add Screen Positioning columns to deployed_objects table
-- Date: February 5, 2026
-- Purpose: Enable agents to be positioned at fixed screen coordinates (x,y%)
--          in addition to GPS coordinates for consistent cross-device placement

-- Add new columns
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS screen_position_x double precision,
ADD COLUMN IF NOT EXISTS screen_position_y double precision,
ADD COLUMN IF NOT EXISTS positioning_mode varchar(20) DEFAULT 'gps';

-- Add check constraint for positioning_mode
ALTER TABLE deployed_objects
ADD CONSTRAINT check_positioning_mode
CHECK (positioning_mode IN ('gps', 'screen'));

-- Add check constraints for screen position ranges (0-100%)
ALTER TABLE deployed_objects
ADD CONSTRAINT check_screen_position_x_range
CHECK (screen_position_x IS NULL OR (screen_position_x >= 0 AND screen_position_x <= 100));

ALTER TABLE deployed_objects
ADD CONSTRAINT check_screen_position_y_range
CHECK (screen_position_y IS NULL OR (screen_position_y >= 0 AND screen_position_y <= 100));

-- Add index for screen-positioned agents queries
CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_mode
ON deployed_objects (positioning_mode)
WHERE positioning_mode = 'screen';

-- Add composite index for screen position lookups
CREATE INDEX IF NOT EXISTS idx_deployed_objects_screen_positions
ON deployed_objects (screen_position_x, screen_position_y)
WHERE positioning_mode = 'screen';

-- Add comments for documentation
COMMENT ON COLUMN deployed_objects.screen_position_x IS 'Horizontal screen position as percentage (0-100). 0=left edge, 50=center, 100=right edge';
COMMENT ON COLUMN deployed_objects.screen_position_y IS 'Vertical screen position as percentage (0-100). 0=top edge, 50=center, 100=bottom edge';
COMMENT ON COLUMN deployed_objects.positioning_mode IS 'Positioning type: gps (real-world GPS coordinates) or screen (fixed screen percentage coordinates)';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Successfully added screen positioning columns to deployed_objects table';
    RAISE NOTICE 'New columns: screen_position_x, screen_position_y, positioning_mode';
    RAISE NOTICE 'Default positioning_mode is "gps" - existing agents unaffected';
END $$;
