# Supabase Setup Instructions for AR QR System

## Quick Setup

The AR QR system now works with **local fallback** when Supabase isn't fully configured, but for production use, you'll want to set up the database table.

## Option 1: Use Local Fallback (Currently Active)

✅ **The system is already working!**

When you generate AR QR codes, they will be stored locally in the browser and work perfectly for testing. You'll see messages like:

```
"No Supabase connection, creating local AR QR code"
"Created local AR QR code: {id: 'local_...'}"
```

## Option 2: Set Up Supabase Table (For Production)

### Step 1: Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your project: `ncjbwzibnqrbrvicdmec`

### Step 2: Create the Table

1. Go to **SQL Editor** in the Supabase dashboard
2. Copy and paste the contents of `sql/ar_qr_codes_schema.sql`
3. Click **Run** to execute the SQL

### Step 3: Verify Table Creation

After running the SQL, you should see:

- ✅ `ar_qr_codes` table created
- ✅ Indexes for performance
- ✅ Row Level Security enabled
- ✅ Triggers for auto-updates

## Testing Your Setup

### Test with Local Fallback (Works Now)

1. Open the app at `http://localhost:5174/`
2. Start camera and click on an agent
3. Click "Generate Floating AR QR Code"
4. You should see a 3D floating QR code appear!

### Test with Supabase (After Setup)

Once the table is created, the system will automatically use Supabase for:

- ✅ Persistent AR QR codes across sessions
- ✅ Real-time updates between users
- ✅ Automatic cleanup of expired codes

## Verification

### Console Messages for Local Mode:

```javascript
"No Supabase connection, creating local AR QR code";
"Created local AR QR code: {id: 'local_1642789123456_abc123'}";
```

### Console Messages for Supabase Mode:

```javascript
"✅ QR Code scanned successfully";
"Created QR code in Supabase: {id: '...'}";
```

## Current Status

🎯 **Ready to Use**: The AR QR system works immediately with local storage
🔧 **Optional**: Set up Supabase table for production features
🚀 **Testing**: Start generating floating QR codes right now!

The local fallback ensures you can test and use the AR QR system immediately while the database setup is optional for enhanced features.
