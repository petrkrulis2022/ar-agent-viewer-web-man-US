-- Add ENS payment columns to deployed_objects table
ALTER TABLE deployed_objects
ADD COLUMN IF NOT EXISTS ens_payment_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS ens_domain TEXT,
ADD COLUMN IF NOT EXISTS ens_address TEXT,
ADD COLUMN IF NOT EXISTS ens_resolver_network TEXT DEFAULT 'mainnet';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_enabled ON deployed_objects(ens_payment_enabled);
CREATE INDEX IF NOT EXISTS idx_deployed_objects_ens_domain ON deployed_objects(ens_domain);

COMMENT ON COLUMN deployed_objects.ens_payment_enabled IS 'Whether ENS payments are enabled for this agent';
COMMENT ON COLUMN deployed_objects.ens_domain IS 'ENS domain name (e.g., cube-pay.eth)';
COMMENT ON COLUMN deployed_objects.ens_address IS 'Ethereum address resolved from ENS domain';
COMMENT ON COLUMN deployed_objects.ens_resolver_network IS 'Network to resolve ENS on (mainnet or sepolia)';
