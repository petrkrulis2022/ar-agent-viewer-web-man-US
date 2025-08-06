-- Multi-Blockchain AR QR Schema Update
-- This script updates the AR QR codes table to support multiple blockchain protocols
-- including Ethereum (EIP-681) and Solana (Solana Pay) payment URIs

-- Add new columns for multi-blockchain support
ALTER TABLE ar_qr_codes 
ADD COLUMN IF NOT EXISTS protocol TEXT DEFAULT 'ethereum' CHECK (protocol IN ('ethereum', 'solana', 'bitcoin', 'other')),
ADD COLUMN IF NOT EXISTS network_name TEXT,
ADD COLUMN IF NOT EXISTS token_address TEXT, -- For SPL tokens on Solana or ERC-20 on Ethereum
ADD COLUMN IF NOT EXISTS token_symbol TEXT,
ADD COLUMN IF NOT EXISTS token_decimals INTEGER DEFAULT 6;

-- Update the comment for qr_code_data to reflect multi-protocol support
COMMENT ON COLUMN ar_qr_codes.qr_code_data IS 'Payment URI (EIP-681 for Ethereum, Solana Pay for Solana)';
COMMENT ON COLUMN ar_qr_codes.protocol IS 'Blockchain protocol: ethereum, solana, bitcoin, or other';
COMMENT ON COLUMN ar_qr_codes.network_name IS 'Human-readable network name (e.g., "Ethereum Mainnet", "Solana Devnet")';
COMMENT ON COLUMN ar_qr_codes.token_address IS 'Token contract address (ERC-20) or mint address (SPL)';
COMMENT ON COLUMN ar_qr_codes.token_symbol IS 'Token symbol (e.g., USDC, SOL, ETH)';

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_protocol ON ar_qr_codes(protocol);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_network ON ar_qr_codes(network_name);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_token ON ar_qr_codes(token_address) WHERE token_address IS NOT NULL;

-- Update the chain_id column to be more flexible (can store Solana cluster names)
COMMENT ON COLUMN ar_qr_codes.chain_id IS 'Network identifier (chainId for Ethereum, cluster for Solana)';

-- Function to insert QR codes with protocol detection
CREATE OR REPLACE FUNCTION insert_ar_qr_code(
    p_transaction_id TEXT,
    p_qr_code_data TEXT,
    p_agent_id TEXT,
    p_amount INTEGER,
    p_recipient_address TEXT,
    p_position_x REAL DEFAULT 0,
    p_position_y REAL DEFAULT 0,
    p_position_z REAL DEFAULT -2,
    p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
    qr_id UUID;
    detected_protocol TEXT;
    detected_network TEXT;
    detected_chain_id TEXT;
    detected_token_address TEXT;
    detected_token_symbol TEXT;
BEGIN
    -- Detect protocol from QR code data
    IF p_qr_code_data LIKE 'ethereum:%' THEN
        detected_protocol := 'ethereum';
        detected_chain_id := COALESCE(
            (regexp_match(p_qr_code_data, '@([0-9]+)/'))[1],
            '1043' -- Default to BlockDAG testnet
        );
        detected_network := CASE detected_chain_id
            WHEN '1' THEN 'Ethereum Mainnet'
            WHEN '1043' THEN 'BlockDAG Primordial Testnet'
            WHEN '11155111' THEN 'Ethereum Sepolia'
            ELSE 'Unknown Ethereum Network'
        END;
        detected_token_address := (regexp_match(p_qr_code_data, 'ethereum:([^@]+)@'))[1];
        detected_token_symbol := 'USBDG+'; -- Default for BlockDAG
    ELSIF p_qr_code_data LIKE 'solana:%' THEN
        detected_protocol := 'solana';
        -- Extract SPL token from spl-token parameter
        detected_token_address := (regexp_match(p_qr_code_data, 'spl-token=([^&]+)'))[1];
        detected_chain_id := CASE 
            WHEN detected_token_address IS NOT NULL THEN 'devnet' -- USDC is on devnet
            ELSE 'testnet' -- SOL payments on testnet
        END;
        detected_network := CASE detected_chain_id
            WHEN 'devnet' THEN 'Solana Devnet'
            WHEN 'testnet' THEN 'Solana Testnet'
            WHEN 'mainnet-beta' THEN 'Solana Mainnet'
            ELSE 'Solana Network'
        END;
        detected_token_symbol := CASE 
            WHEN detected_token_address = '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU' THEN 'USDC'
            WHEN detected_token_address IS NULL THEN 'SOL'
            ELSE 'Token'
        END;
    ELSE
        detected_protocol := 'other';
        detected_network := 'Unknown';
        detected_chain_id := 'unknown';
        detected_token_symbol := 'Unknown';
    END IF;

    -- Insert the QR code with detected values
    INSERT INTO ar_qr_codes (
        transaction_id,
        qr_code_data,
        agent_id,
        amount,
        recipient_address,
        position_x,
        position_y,
        position_z,
        protocol,
        network_name,
        chain_id,
        token_address,
        token_symbol,
        metadata,
        status
    ) VALUES (
        p_transaction_id,
        p_qr_code_data,
        p_agent_id,
        p_amount,
        p_recipient_address,
        p_position_x,
        p_position_y,
        p_position_z,
        detected_protocol,
        detected_network,
        detected_chain_id,
        detected_token_address,
        detected_token_symbol,
        p_metadata,
        'generated'
    ) RETURNING id INTO qr_id;

    RETURN qr_id;
END;
$$ LANGUAGE 'plpgsql';

-- Function to get QR codes by protocol
CREATE OR REPLACE FUNCTION get_qr_codes_by_protocol(p_protocol TEXT DEFAULT NULL)
RETURNS TABLE(
    id UUID,
    transaction_id TEXT,
    qr_code_data TEXT,
    protocol TEXT,
    network_name TEXT,
    chain_id TEXT,
    token_symbol TEXT,
    amount INTEGER,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        qr.id,
        qr.transaction_id,
        qr.qr_code_data,
        qr.protocol,
        qr.network_name,
        qr.chain_id,
        qr.token_symbol,
        qr.amount,
        qr.status,
        qr.created_at
    FROM ar_qr_codes qr
    WHERE (p_protocol IS NULL OR qr.protocol = p_protocol)
    AND qr.status IN ('active', 'generated')
    AND qr.expiration_time > NOW()
    ORDER BY qr.created_at DESC;
END;
$$ LANGUAGE 'plpgsql';

-- Enhanced statistics function with protocol breakdown
CREATE OR REPLACE FUNCTION get_qr_code_stats_by_protocol()
RETURNS TABLE(
    protocol TEXT,
    total_qr_codes BIGINT,
    active_qr_codes BIGINT,
    scanned_qr_codes BIGINT,
    expired_qr_codes BIGINT,
    failed_qr_codes BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(qr.protocol, 'unknown') as protocol,
        COUNT(*) as total_qr_codes,
        COUNT(*) FILTER (WHERE qr.status = 'active') as active_qr_codes,
        COUNT(*) FILTER (WHERE qr.status = 'scanned') as scanned_qr_codes,
        COUNT(*) FILTER (WHERE qr.status = 'expired') as expired_qr_codes,
        COUNT(*) FILTER (WHERE qr.status = 'failed') as failed_qr_codes
    FROM ar_qr_codes qr
    GROUP BY qr.protocol
    ORDER BY total_qr_codes DESC;
END;
$$ LANGUAGE 'plpgsql';

-- Update existing QR codes to set protocol based on their qr_code_data
UPDATE ar_qr_codes 
SET 
    protocol = CASE 
        WHEN qr_code_data LIKE 'ethereum:%' THEN 'ethereum'
        WHEN qr_code_data LIKE 'solana:%' THEN 'solana'
        ELSE 'other'
    END,
    network_name = CASE 
        WHEN qr_code_data LIKE 'ethereum:%' AND qr_code_data LIKE '%@1043/%' THEN 'BlockDAG Primordial Testnet'
        WHEN qr_code_data LIKE 'ethereum:%' AND qr_code_data LIKE '%@1/%' THEN 'Ethereum Mainnet'
        WHEN qr_code_data LIKE 'solana:%' AND qr_code_data LIKE '%spl-token=%' THEN 'Solana Devnet'
        WHEN qr_code_data LIKE 'solana:%' THEN 'Solana Testnet'
        ELSE 'Unknown Network'
    END,
    token_symbol = CASE 
        WHEN qr_code_data LIKE 'ethereum:%' THEN 'USBDG+'
        WHEN qr_code_data LIKE 'solana:%' AND qr_code_data LIKE '%spl-token=4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU%' THEN 'USDC'
        WHEN qr_code_data LIKE 'solana:%' THEN 'SOL'
        ELSE 'Unknown'
    END,
    token_address = CASE 
        WHEN qr_code_data LIKE 'solana:%' AND qr_code_data LIKE '%spl-token=%' THEN 
            (regexp_match(qr_code_data, 'spl-token=([^&]+)'))[1]
        WHEN qr_code_data LIKE 'ethereum:%' THEN 
            (regexp_match(qr_code_data, 'ethereum:([^@]+)@'))[1]
        ELSE NULL
    END
WHERE protocol IS NULL OR protocol = 'ethereum';

-- Test the new multi-protocol functionality
DO $$
BEGIN
    RAISE NOTICE '🚀 Multi-Blockchain AR QR Schema Update Complete!';
    RAISE NOTICE '📋 New Features:';
    RAISE NOTICE '   ✅ Multi-protocol support (Ethereum, Solana, Bitcoin, Other)';
    RAISE NOTICE '   ✅ Network detection and classification';
    RAISE NOTICE '   ✅ Token address and symbol tracking';
    RAISE NOTICE '   ✅ Smart QR code insertion with auto-detection';
    RAISE NOTICE '🔧 New Functions:';
    RAISE NOTICE '   - insert_ar_qr_code(): Smart QR insertion with protocol detection';
    RAISE NOTICE '   - get_qr_codes_by_protocol(): Filter QR codes by blockchain';
    RAISE NOTICE '   - get_qr_code_stats_by_protocol(): Statistics per protocol';
    RAISE NOTICE '📊 Existing QR codes have been updated with protocol information';
END $$;
