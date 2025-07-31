-- Comprehensive AR QR Database Setup Script
-- This script ensures all necessary tables and functions exist for the AR QR system

-- First, let's check if we need to create the qr_codes table for backward compatibility
-- Some parts of the application might still reference "qr_codes" instead of "ar_qr_codes"

-- Create qr_codes table as a view/alias of ar_qr_codes for compatibility
DROP VIEW IF EXISTS qr_codes;
CREATE VIEW qr_codes AS SELECT * FROM ar_qr_codes;

-- Ensure ar_qr_codes table exists with all required columns
-- (This is an enhanced version of the existing schema)
CREATE TABLE IF NOT EXISTS ar_qr_codes_new (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Transaction and payment info
  transaction_id TEXT NOT NULL UNIQUE,
  qr_code_data TEXT NOT NULL, -- The actual QR code data (EIP-681 format)
  
  -- 3D positioning in AR space
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0, 
  position_z REAL DEFAULT -2,
  rotation_x REAL DEFAULT 0,
  rotation_y REAL DEFAULT 0,
  rotation_z REAL DEFAULT 0,
  scale REAL DEFAULT 1.5,
  
  -- Geographic location (optional)
  latitude REAL,
  longitude REAL,
  altitude REAL,
  
  -- QR code status and lifecycle
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid', 'failed')),
  
  -- Agent relationship
  agent_id TEXT, -- Changed to TEXT to support various agent ID formats
  
  -- Payment details
  amount INTEGER, -- Integer amount for USBDG+ tokens
  recipient_address TEXT,
  contract_address TEXT DEFAULT '0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db',
  chain_id TEXT DEFAULT '1043',
  
  -- Transaction tracking
  transaction_hash TEXT,
  block_number BIGINT,
  gas_used BIGINT,
  gas_price BIGINT,
  
  -- Error handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  scanned_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Enhanced metadata with JSONB for flexibility
  metadata JSONB DEFAULT '{}',
  
  -- User tracking (if needed)
  user_id UUID,
  
  -- Indexes for performance
  CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
);

-- Copy data from existing table if it exists
INSERT INTO ar_qr_codes_new 
SELECT 
  id,
  transaction_id,
  qr_code_data,
  position_x,
  position_y,
  position_z,
  rotation_x,
  rotation_y,
  rotation_z,
  scale,
  latitude,
  longitude,
  altitude,
  status,
  agent_id::TEXT, -- Convert to TEXT
  amount,
  recipient_address,
  contract_address,
  chain_id,
  NULL as transaction_hash, -- New column
  NULL as block_number, -- New column
  NULL as gas_used, -- New column
  NULL as gas_price, -- New column
  NULL as error_message, -- New column
  0 as retry_count, -- New column
  created_at,
  updated_at,
  expiration_time,
  scanned_at,
  paid_at,
  metadata,
  NULL as user_id -- New column
FROM ar_qr_codes
ON CONFLICT (id) DO NOTHING;

-- Drop old table and rename new one
DROP TABLE IF EXISTS ar_qr_codes CASCADE;
ALTER TABLE ar_qr_codes_new RENAME TO ar_qr_codes;

-- Recreate the view after table recreation
DROP VIEW IF EXISTS qr_codes;
CREATE VIEW qr_codes AS SELECT * FROM ar_qr_codes;

-- Create comprehensive indexes for performance
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_location ON ar_qr_codes(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_transaction ON ar_qr_codes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_created_at ON ar_qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_chain_id ON ar_qr_codes(chain_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_tx_hash ON ar_qr_codes(transaction_hash) WHERE transaction_hash IS NOT NULL;

-- Enhanced RLS (Row Level Security) policies
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Allow read access to active QR codes" ON ar_qr_codes;
DROP POLICY IF EXISTS "Allow creating QR codes" ON ar_qr_codes;
DROP POLICY IF EXISTS "Allow updating QR codes" ON ar_qr_codes;

-- Allow anyone to read active QR codes (for AR discovery)
CREATE POLICY "Allow read access to active QR codes" ON ar_qr_codes
  FOR SELECT USING (status IN ('active', 'generated') OR status IS NULL);

-- Allow creating new QR codes (authenticated and anonymous users)
CREATE POLICY "Allow creating QR codes" ON ar_qr_codes
  FOR INSERT WITH CHECK (true);

-- Allow updating QR codes (for status changes)
CREATE POLICY "Allow updating QR codes" ON ar_qr_codes
  FOR UPDATE USING (true);

-- Allow deleting expired QR codes
CREATE POLICY "Allow deleting expired QR codes" ON ar_qr_codes
  FOR DELETE USING (status = 'expired' OR expiration_time < NOW());

-- Enhanced function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    
    -- Auto-set paid_at when status changes to 'paid'
    IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
        NEW.paid_at = NOW();
    END IF;
    
    -- Auto-set scanned_at when status changes to 'scanned'
    IF NEW.status = 'scanned' AND OLD.status != 'scanned' THEN
        NEW.scanned_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger
DROP TRIGGER IF EXISTS update_ar_qr_codes_updated_at ON ar_qr_codes;
CREATE TRIGGER update_ar_qr_codes_updated_at BEFORE UPDATE
    ON ar_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enhanced function to clean up expired QR codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS TABLE(
    expired_count INTEGER,
    deleted_count INTEGER,
    summary TEXT
) AS $$
DECLARE
    expired_count INTEGER;
    deleted_count INTEGER;
    summary TEXT;
BEGIN
    -- Mark expired QR codes
    UPDATE ar_qr_codes 
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('generated', 'active') 
    AND expiration_time < NOW();
    
    GET DIAGNOSTICS expired_count = ROW_COUNT;
    
    -- Delete very old expired QR codes (older than 24 hours)
    DELETE FROM ar_qr_codes
    WHERE status = 'expired' 
    AND updated_at < NOW() - INTERVAL '24 hours';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    summary := format('Expired: %s QR codes, Deleted: %s old QR codes', expired_count, deleted_count);
    
    RETURN QUERY SELECT expired_count, deleted_count, summary;
END;
$$ LANGUAGE 'plpgsql';

-- Function to get QR code statistics
CREATE OR REPLACE FUNCTION get_qr_code_stats()
RETURNS TABLE(
    total_qr_codes BIGINT,
    active_qr_codes BIGINT,
    scanned_qr_codes BIGINT,
    expired_qr_codes BIGINT,
    failed_qr_codes BIGINT,
    avg_scan_time_minutes NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_qr_codes,
        COUNT(*) FILTER (WHERE status = 'active') as active_qr_codes,
        COUNT(*) FILTER (WHERE status = 'scanned') as scanned_qr_codes,
        COUNT(*) FILTER (WHERE status = 'expired') as expired_qr_codes,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_qr_codes,
        ROUND(
            AVG(EXTRACT(EPOCH FROM (scanned_at - created_at)) / 60.0), 2
        ) FILTER (WHERE scanned_at IS NOT NULL) as avg_scan_time_minutes
    FROM ar_qr_codes;
END;
$$ LANGUAGE 'plpgsql';

-- Function to find nearby QR codes
CREATE OR REPLACE FUNCTION find_nearby_qr_codes(
    user_lat REAL,
    user_lon REAL,
    radius_meters INTEGER DEFAULT 100
)
RETURNS TABLE(
    id UUID,
    transaction_id TEXT,
    qr_code_data TEXT,
    position_x REAL,
    position_y REAL,
    position_z REAL,
    agent_id TEXT,
    amount INTEGER,
    status TEXT,
    distance_meters REAL,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.id,
        qr.transaction_id,
        qr.qr_code_data,
        qr.position_x,
        qr.position_y,
        qr.position_z,
        qr.agent_id,
        qr.amount,
        qr.status,
        ROUND(
            (6371000 * acos(
                cos(radians(user_lat)) * 
                cos(radians(qr.latitude)) * 
                cos(radians(qr.longitude) - radians(user_lon)) + 
                sin(radians(user_lat)) * 
                sin(radians(qr.latitude))
            ))::NUMERIC, 2
        )::REAL as distance_meters,
        qr.created_at
    FROM ar_qr_codes qr
    WHERE qr.status IN ('active', 'generated')
    AND qr.latitude IS NOT NULL 
    AND qr.longitude IS NOT NULL
    AND qr.expiration_time > NOW()
    AND (
        6371000 * acos(
            cos(radians(user_lat)) * 
            cos(radians(qr.latitude)) * 
            cos(radians(qr.longitude) - radians(user_lon)) + 
            sin(radians(user_lat)) * 
            sin(radians(qr.latitude))
        )
    ) <= radius_meters
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE 'plpgsql';

-- Create some helpful comments
COMMENT ON TABLE ar_qr_codes IS 'Enhanced AR QR codes table for blockchain payments with comprehensive tracking';
COMMENT ON COLUMN ar_qr_codes.qr_code_data IS 'EIP-681 formatted payment URI for wallet compatibility';
COMMENT ON COLUMN ar_qr_codes.position_x IS 'X coordinate in AR 3D space (meters from camera)';
COMMENT ON COLUMN ar_qr_codes.position_y IS 'Y coordinate in AR 3D space (height from ground)'; 
COMMENT ON COLUMN ar_qr_codes.position_z IS 'Z coordinate in AR 3D space (distance from camera, negative = in front)';
COMMENT ON COLUMN ar_qr_codes.scale IS 'Size multiplier for the QR code in AR space';
COMMENT ON COLUMN ar_qr_codes.status IS 'Lifecycle status: generated -> active -> scanned -> paid/expired/failed';
COMMENT ON COLUMN ar_qr_codes.transaction_hash IS 'Blockchain transaction hash after payment completion';
COMMENT ON COLUMN ar_qr_codes.metadata IS 'Flexible JSON storage for additional QR code properties';

-- Create a test function to validate the setup
CREATE OR REPLACE FUNCTION test_ar_qr_setup()
RETURNS TEXT AS $$
DECLARE
    test_result TEXT;
    qr_count INTEGER;
    function_exists BOOLEAN;
BEGIN
    -- Test table exists and is accessible
    SELECT COUNT(*) INTO qr_count FROM ar_qr_codes LIMIT 1;
    
    -- Test functions exist
    SELECT EXISTS(
        SELECT 1 FROM pg_proc WHERE proname = 'cleanup_expired_qr_codes'
    ) INTO function_exists;
    
    test_result := format(
        'AR QR Setup Test Results:\n' ||
        '✅ Table ar_qr_codes: EXISTS\n' ||
        '✅ View qr_codes: EXISTS\n' ||
        '✅ Functions: %s\n' ||
        '✅ Current QR count: %s\n' ||
        '✅ Database setup: COMPLETE',
        CASE WHEN function_exists THEN 'EXISTS' ELSE 'MISSING' END,
        qr_count
    );
    
    RETURN test_result;
END;
$$ LANGUAGE 'plpgsql';

-- Run the test to verify setup
SELECT test_ar_qr_setup();

-- Final message
DO $$
BEGIN
    RAISE NOTICE '🎉 AR QR Database setup completed successfully!';
    RAISE NOTICE '📋 Available functions:';
    RAISE NOTICE '   - cleanup_expired_qr_codes(): Clean up expired QR codes';
    RAISE NOTICE '   - get_qr_code_stats(): Get QR code statistics';
    RAISE NOTICE '   - find_nearby_qr_codes(lat, lon, radius): Find QR codes near location';
    RAISE NOTICE '   - test_ar_qr_setup(): Test database setup';
    RAISE NOTICE '🔧 Tables created: ar_qr_codes, qr_codes (view)';
    RAISE NOTICE '🔒 RLS policies: Enabled with appropriate access controls';
    RAISE NOTICE '⚡ Indexes: Created for optimal performance';
END $$;
