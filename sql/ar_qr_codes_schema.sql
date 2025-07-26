-- AR QR Codes table for managing floating QR codes in the AR environment
-- This table stores QR codes as AR objects that can be positioned in 3D space

CREATE TABLE IF NOT EXISTS ar_qr_codes (
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
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid')),
  
  -- Agent relationship
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  
  -- Payment details
  amount INTEGER, -- Integer amount for USBDG+ tokens
  recipient_address TEXT,
  contract_address TEXT DEFAULT '0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db',
  chain_id TEXT DEFAULT '1043',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  scanned_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  -- Indexes for performance
  CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_location ON ar_qr_codes(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_transaction ON ar_qr_codes(transaction_id);

-- RLS (Row Level Security) policies
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read active QR codes (for AR discovery)
CREATE POLICY "Allow read access to active QR codes" ON ar_qr_codes
  FOR SELECT USING (status IN ('active', 'generated'));

-- Allow creating new QR codes (authenticated users)
CREATE POLICY "Allow creating QR codes" ON ar_qr_codes
  FOR INSERT WITH CHECK (true);

-- Allow updating QR codes (for status changes)
CREATE POLICY "Allow updating QR codes" ON ar_qr_codes
  FOR UPDATE USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_ar_qr_codes_updated_at BEFORE UPDATE
    ON ar_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to clean up expired QR codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_qr_codes()
RETURNS INTEGER AS $$
DECLARE
    affected_count INTEGER;
BEGIN
    UPDATE ar_qr_codes 
    SET status = 'expired', updated_at = NOW()
    WHERE status IN ('generated', 'active') 
    AND expiration_time < NOW();
    
    GET DIAGNOSTICS affected_count = ROW_COUNT;
    RETURN affected_count;
END;
$$ LANGUAGE 'plpgsql';

-- Example usage and test data (remove in production)
-- INSERT INTO ar_qr_codes (
--   transaction_id,
--   qr_code_data,
--   position_x, position_y, position_z,
--   agent_id,
--   amount,
--   recipient_address
-- ) VALUES (
--   'test_tx_123',
--   'ethereum:0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db@1043/transfer?address=0x1234567890123456789012345678901234567890&uint256=50',
--   0, 0.5, -2,
--   (SELECT id FROM agents LIMIT 1),
--   50,
--   '0x1234567890123456789012345678901234567890'
-- );

COMMENT ON TABLE ar_qr_codes IS 'Stores QR codes as 3D AR objects for blockchain payments';
COMMENT ON COLUMN ar_qr_codes.qr_code_data IS 'EIP-681 formatted payment URI';
COMMENT ON COLUMN ar_qr_codes.position_x IS 'X coordinate in AR 3D space';
COMMENT ON COLUMN ar_qr_codes.position_y IS 'Y coordinate in AR 3D space'; 
COMMENT ON COLUMN ar_qr_codes.position_z IS 'Z coordinate in AR 3D space (negative values are in front of camera)';
COMMENT ON COLUMN ar_qr_codes.scale IS 'Size multiplier for the QR code in AR space';
COMMENT ON COLUMN ar_qr_codes.status IS 'Lifecycle status: generated -> active -> scanned -> paid/expired';
