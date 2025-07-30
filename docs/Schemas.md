# Database Schemas Documentation

## 📋 Overview

This document contains all database schemas, table definitions, and data models used in the AR Viewer project. The primary database is PostgreSQL hosted on Supabase.

## 🗄️ Database Tables

### 1. AR QR Codes Table

**Purpose**: Manages floating QR codes in the AR environment as 3D positioned objects

```sql
CREATE TABLE IF NOT EXISTS ar_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Transaction and payment info
  transaction_id TEXT NOT NULL UNIQUE,
  qr_code_data TEXT NOT NULL, -- EIP-681 format for blockchain payments

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

  -- QR code lifecycle management
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid')),

  -- Agent relationship
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,

  -- Payment details (multi-blockchain support)
  amount BIGINT, -- Token amount in smallest units (wei, lamports, etc.)
  recipient_address TEXT,
  contract_address TEXT,
  chain_id TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  scanned_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,

  -- Extensible metadata
  metadata JSONB DEFAULT '{}',

  -- Constraints
  CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
);
```

#### Status Lifecycle

```
generated → active → scanned → paid
     ↓         ↓        ↓        ↓
  expired   expired  expired  completed
```

#### Field Descriptions

- **position_x/y/z**: 3D coordinates in AR space (z-negative = in front of camera)
- **scale**: Size multiplier for QR code display (default 1.5)
- **qr_code_data**: EIP-681 formatted payment URI
- **amount**: Token amount in smallest units (supports all decimal precisions)
- **metadata**: Extensible JSON field for future features

### 2. Agents Table

**Purpose**: Stores AR agent data and metadata

```sql
CREATE TABLE IF NOT EXISTS agents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Basic agent info
  name TEXT NOT NULL,
  description TEXT,
  agent_type TEXT DEFAULT 'Intelligent Assistant',

  -- 3D model and appearance
  model_url TEXT,
  texture_url TEXT,
  animation_set JSONB DEFAULT '{}',

  -- Position and behavior
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  position_z REAL DEFAULT 0,
  rotation_y REAL DEFAULT 0,
  scale REAL DEFAULT 1,

  -- Agent capabilities
  capabilities JSONB DEFAULT '[]',
  personality_traits JSONB DEFAULT '{}',

  -- Payment settings
  wallet_address TEXT,
  payment_enabled BOOLEAN DEFAULT true,
  service_fee_usd DECIMAL(10,2) DEFAULT 1.00,

  -- Metadata
  metadata JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. User Profiles Table

**Purpose**: User account and preference management

```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,

  -- Profile information
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,

  -- Preferences
  preferences JSONB DEFAULT '{}',

  -- Wallet connections
  wallet_addresses JSONB DEFAULT '{}', -- {blockchain: address}

  -- Usage statistics
  total_interactions INTEGER DEFAULT 0,
  total_payments DECIMAL(10,2) DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Payment Transactions Table

**Purpose**: Transaction history and audit trail

```sql
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Transaction identification
  transaction_hash TEXT UNIQUE, -- Blockchain transaction hash
  transaction_id TEXT NOT NULL, -- Internal transaction ID

  -- Parties involved
  user_id UUID REFERENCES user_profiles(id),
  agent_id UUID REFERENCES agents(id),
  qr_code_id UUID REFERENCES ar_qr_codes(id),

  -- Payment details
  amount BIGINT NOT NULL, -- Amount in smallest token units
  token_symbol TEXT NOT NULL, -- USBDG+, SOL, USDT, etc.
  token_contract TEXT, -- Contract address for tokens

  -- Blockchain information
  blockchain_network TEXT NOT NULL, -- blockdag, solana, morph
  chain_id TEXT NOT NULL,
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,

  -- Transaction status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'cancelled')),

  -- Blockchain confirmation
  block_number BIGINT,
  confirmation_count INTEGER DEFAULT 0,
  gas_used BIGINT,
  gas_price BIGINT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,

  -- Additional data
  metadata JSONB DEFAULT '{}'
);
```

## 🔐 Security Policies (RLS)

### AR QR Codes Policies

```sql
-- Enable Row Level Security
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- Allow reading active QR codes for AR discovery
CREATE POLICY "Allow read access to active QR codes" ON ar_qr_codes
  FOR SELECT USING (status IN ('active', 'generated'));

-- Allow creating QR codes (authenticated users)
CREATE POLICY "Allow creating QR codes" ON ar_qr_codes
  FOR INSERT WITH CHECK (true);

-- Allow updating QR codes for status changes
CREATE POLICY "Allow updating QR codes" ON ar_qr_codes
  FOR UPDATE USING (true);
```

### User Profiles Policies

```sql
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
```

## 📊 Database Indexes

### Performance Indexes

```sql
-- AR QR Codes indexes
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_location ON ar_qr_codes(latitude, longitude)
  WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_transaction ON ar_qr_codes(transaction_id);

-- Agents indexes
CREATE INDEX IF NOT EXISTS idx_agents_type ON agents(agent_type);
CREATE INDEX IF NOT EXISTS idx_agents_payment_enabled ON agents(payment_enabled)
  WHERE payment_enabled = true;

-- Payment transactions indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_agent ON payment_transactions(agent_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_hash ON payment_transactions(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_network ON payment_transactions(blockchain_network);
```

## 🔄 Database Functions

### Auto-Update Timestamp Trigger

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_ar_qr_codes_updated_at BEFORE UPDATE
    ON ar_qr_codes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agents_updated_at BEFORE UPDATE
    ON agents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Cleanup Expired QR Codes

```sql
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
```

### Payment Statistics Function

```sql
CREATE OR REPLACE FUNCTION get_payment_stats(user_uuid UUID)
RETURNS TABLE(
    total_payments BIGINT,
    total_amount DECIMAL,
    favorite_agent UUID,
    networks_used TEXT[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::BIGINT as total_payments,
        SUM(amount)::DECIMAL as total_amount,
        mode() WITHIN GROUP (ORDER BY agent_id) as favorite_agent,
        array_agg(DISTINCT blockchain_network) as networks_used
    FROM payment_transactions
    WHERE user_id = user_uuid AND status = 'confirmed';
END;
$$ LANGUAGE 'plpgsql';
```

## 🎯 Data Models (TypeScript)

### AR QR Code Model

```typescript
interface ARQRCode {
  id: string;
  transaction_id: string;
  qr_code_data: string;

  // 3D Position
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_x: number;
  rotation_y: number;
  rotation_z: number;
  scale: number;

  // Geographic Location
  latitude?: number;
  longitude?: number;
  altitude?: number;

  // Status & Lifecycle
  status: "generated" | "active" | "scanned" | "expired" | "paid";

  // Relationships
  agent_id: string;

  // Payment Details
  amount: bigint;
  recipient_address: string;
  contract_address?: string;
  chain_id: string;

  // Timestamps
  created_at: string;
  updated_at: string;
  expiration_time: string;
  scanned_at?: string;
  paid_at?: string;

  // Metadata
  metadata: Record<string, any>;
}
```

### Agent Model

```typescript
interface Agent {
  id: string;
  name: string;
  description?: string;
  agent_type: string;

  // 3D Model
  model_url?: string;
  texture_url?: string;
  animation_set: Record<string, any>;

  // Position
  position_x: number;
  position_y: number;
  position_z: number;
  rotation_y: number;
  scale: number;

  // Capabilities
  capabilities: string[];
  personality_traits: Record<string, any>;

  // Payment
  wallet_address?: string;
  payment_enabled: boolean;
  service_fee_usd: number;

  // Metadata
  metadata: Record<string, any>;

  // Timestamps
  created_at: string;
  updated_at: string;
}
```

### Payment Transaction Model

```typescript
interface PaymentTransaction {
  id: string;
  transaction_hash?: string;
  transaction_id: string;

  // Parties
  user_id?: string;
  agent_id: string;
  qr_code_id: string;

  // Payment Details
  amount: bigint;
  token_symbol: string;
  token_contract?: string;

  // Blockchain
  blockchain_network: "blockdag" | "solana" | "morph";
  chain_id: string;
  from_address: string;
  to_address: string;

  // Status
  status: "pending" | "confirmed" | "failed" | "cancelled";

  // Confirmation
  block_number?: bigint;
  confirmation_count: number;
  gas_used?: bigint;
  gas_price?: bigint;

  // Timestamps
  created_at: string;
  confirmed_at?: string;

  // Metadata
  metadata: Record<string, any>;
}
```

## 🔍 Common Queries

### Active QR Codes by Agent

```sql
SELECT qr.*, a.name as agent_name
FROM ar_qr_codes qr
JOIN agents a ON qr.agent_id = a.id
WHERE qr.status = 'active'
  AND qr.expiration_time > NOW()
ORDER BY qr.created_at DESC;
```

### Payment History for User

```sql
SELECT pt.*, a.name as agent_name, qr.qr_code_data
FROM payment_transactions pt
JOIN agents a ON pt.agent_id = a.id
JOIN ar_qr_codes qr ON pt.qr_code_id = qr.id
WHERE pt.user_id = $1
ORDER BY pt.created_at DESC;
```

### Agent Performance Statistics

```sql
SELECT
  a.name,
  COUNT(pt.id) as total_transactions,
  SUM(pt.amount) as total_earnings,
  AVG(pt.amount) as avg_transaction,
  COUNT(DISTINCT pt.user_id) as unique_users
FROM agents a
LEFT JOIN payment_transactions pt ON a.id = pt.agent_id
  AND pt.status = 'confirmed'
GROUP BY a.id, a.name
ORDER BY total_earnings DESC NULLS LAST;
```

## 📋 Migration Scripts

### Initial Schema Setup

```sql
-- Run this to set up the complete database schema
\i sql/ar_qr_codes_schema.sql
\i sql/agents_schema.sql
\i sql/user_profiles_schema.sql
\i sql/payment_transactions_schema.sql
```

### Version 1.4.0 Migration (Future)

```sql
-- Add new fields for enhanced features
ALTER TABLE ar_qr_codes ADD COLUMN IF NOT EXISTS
  animation_type TEXT DEFAULT 'pulse';

ALTER TABLE agents ADD COLUMN IF NOT EXISTS
  ai_model_version TEXT DEFAULT 'v1.0';
```

---

**Schema Version**: 1.3.0  
**Last Updated**: July 30, 2025  
**Database**: PostgreSQL (Supabase)  
**Status**: ✅ Production Ready
