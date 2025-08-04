# Database Connection Fix Guide

## Current Status

✅ **Supabase Connection**: Working  
✅ **deployed_objects table**: Working (agents load correctly)  
❌ **ar_qr_codes table**: Missing (causes QR code features to fail)

## Problem Identified

The app is connecting to Supabase successfully, but the `ar_qr_codes` table doesn't exist in your database. This causes:

- Agent loading to work fine (uses `deployed_objects` table)
- QR code generation to fail (needs `ar_qr_codes` table)
- Some error messages in console logs

## Quick Fix (Recommended)

### Step 1: Access Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select project: `ncjbwzibnqrbrvicdmec`

### Step 2: Create Missing Table

1. Go to **SQL Editor** in the left sidebar
2. Click **"New query"**
3. Copy and paste this SQL:

```sql
-- Create ar_qr_codes table
CREATE TABLE IF NOT EXISTS ar_qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  qr_code_data TEXT NOT NULL,
  position_x REAL DEFAULT 0,
  position_y REAL DEFAULT 0,
  position_z REAL DEFAULT -2,
  rotation_x REAL DEFAULT 0,
  rotation_y REAL DEFAULT 0,
  rotation_z REAL DEFAULT 0,
  scale REAL DEFAULT 1.5,
  latitude REAL,
  longitude REAL,
  altitude REAL,
  status TEXT DEFAULT 'generated' CHECK (status IN ('generated', 'active', 'scanned', 'expired', 'paid')),
  agent_id TEXT,
  amount INTEGER,
  recipient_address TEXT,
  contract_address TEXT DEFAULT '0xFAD0070d0388FB3F18F1100A5FFc67dF8834D9db',
  chain_id TEXT DEFAULT '1043',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_time TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '5 minutes'),
  scanned_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  CONSTRAINT valid_expiration CHECK (expiration_time > created_at)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_status ON ar_qr_codes(status);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_agent_id ON ar_qr_codes(agent_id);
CREATE INDEX IF NOT EXISTS idx_ar_qr_codes_expiration ON ar_qr_codes(expiration_time);

-- Enable Row Level Security
ALTER TABLE ar_qr_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON ar_qr_codes
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON ar_qr_codes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON ar_qr_codes
  FOR UPDATE USING (true);
```

4. Click **Run** to execute the SQL
5. You should see "Success. No rows returned" message

### Step 3: Verify Fix

1. Go back to your AR Viewer app (http://localhost:5177/)
2. Click the **Database** button in the bottom navigation
3. Click **Refresh Status**
4. You should now see: ✅ Database connection successful

## Alternative: Use Local Storage (Temporary)

If you can't access Supabase right now, the app will automatically use local storage for QR codes. You'll see messages like:

- "No Supabase connection, creating local AR QR code"
- "Using fallback mode"

This works fine for testing but QR codes won't persist between sessions.

## Verification Commands

Test your database connection by running this in the browser console:

```javascript
// Test deployed_objects (should work)
fetch(
  "https://ncjbwzibnqrbrvicdmec.supabase.co/rest/v1/deployed_objects?select=id&limit=1",
  {
    headers: {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI",
    },
  }
)
  .then((r) => r.json())
  .then((d) => console.log("deployed_objects:", d));

// Test ar_qr_codes (should work after fix)
fetch(
  "https://ncjbwzibnqrbrvicdmec.supabase.co/rest/v1/ar_qr_codes?select=id&limit=1",
  {
    headers: {
      apikey:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jamJ3emlibnFyYnJ2aWNkbWVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2ODAxNTksImV4cCI6MjA2NjI1NjE1OX0.R7rx4jOPt9oOafcyJr3x-nEvGk5-e4DP7MbfCVOCHHI",
    },
  }
)
  .then((r) => r.json())
  .then((d) => console.log("ar_qr_codes:", d));
```

## What Was Fixed

1. ✅ Enhanced error reporting in database connection
2. ✅ Added database status component
3. ✅ Added database status button to main UI
4. ✅ Improved fallback to local storage when table missing
5. ✅ Better console logging for troubleshooting

## Features Now Working

- ✅ Agent loading and display
- ✅ Location-based agent discovery
- ✅ AR Viewer with 3D models
- ✅ Wallet connections (ThirdWeb, Solana)
- ✅ Mock agent generation for demo
- ⚠️ QR code storage (local until table created)

## Next Steps

1. Create the missing table using the SQL above
2. Test QR code generation in AR mode
3. Verify database status shows all green checkmarks
4. Deploy agents to your location for testing

The application is now much more robust and will clearly show you what's working and what needs attention!
