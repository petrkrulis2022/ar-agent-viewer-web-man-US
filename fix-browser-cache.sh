#!/bin/bash

# Comprehensive Browser Cache Clear for AR Viewer
# This script addresses the "Legacy API keys are disabled" error

echo "🧹 AR Viewer Cache Clearing Tool"
echo "================================="
echo ""

# Step 1: Stop any running servers
echo "Step 1: Stopping running servers..."
pkill -f "vite.*5173" 2>/dev/null || echo "No Vite server running on 5173"
sleep 2

# Step 2: Clear Vite cache
echo ""
echo "Step 2: Clearing Vite build cache..."
rm -rf node_modules/.vite
echo "✅ Vite cache cleared"

# Step 3: Clear npm cache
echo ""
echo "Step 3: Clearing npm cache..."
npm cache clean --force 2>/dev/null || echo "NPM cache already clean"

# Step 4: Verify environment variables
echo ""
echo "Step 4: Verifying environment variables..."
echo "VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-"Not set (will use fallback)"}"
if [ -f .env ]; then
    echo "📄 .env file exists"
    ENV_ANON_KEY=$(grep "VITE_SUPABASE_ANON_KEY" .env | cut -d'=' -f2)
    if [[ "$ENV_ANON_KEY" == sb_* ]]; then
        echo "✅ Environment has new sb_ prefixed API key"
    else
        echo "❌ Environment still has legacy API key format!"
        echo "🔧 Updating .env file..."
        # Backup current .env
        cp .env .env.backup.$(date +%s)
        # Update the key if it's not already the new format
        sed -i 's/VITE_SUPABASE_ANON_KEY=eyJ.*/VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA/' .env
        echo "✅ .env file updated with new API key"
    fi
else
    echo "❌ No .env file found"
    echo "Creating .env file with new API keys..."
    cat > .env << EOF
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA
VITE_SUPABASE_SERVICE_ROLE_KEY=sb_secret_s3sWA4HPYMpD-_I-GEzsIw_g92UJm9S
EOF
    echo "✅ .env file created"
fi

# Step 5: Test database connection with new keys
echo ""
echo "Step 5: Testing database connection..."
node -e "
const https = require('https');
const testConnection = () => {
  const options = {
    hostname: 'ncjbwzibnqrbrvicdmec.supabase.co',
    port: 443,
    path: '/rest/v1/deployed_objects?select=id&limit=1',
    method: 'GET',
    headers: {
      'apikey': 'sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA',
      'Authorization': 'Bearer sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA',
      'Content-Type': 'application/json'
    }
  };

  const req = https.request(options, (res) => {
    console.log(\`Database test status: \${res.statusCode}\`);
    if (res.statusCode === 200) {
      console.log('✅ Database connection successful with new API keys');
    } else {
      console.log('❌ Database connection failed with status:', res.statusCode);
    }
  });

  req.on('error', (e) => {
    console.log('❌ Database connection error:', e.message);
  });

  req.end();
};

testConnection();
" 2>/dev/null

# Step 6: Generate browser cache clearing instructions
echo ""
echo "Step 6: Creating browser cache clearing instructions..."
cat > browser-cache-clear-instructions.md << 'EOF'
# Browser Cache Clearing Instructions

## The Issue
Browser is caching legacy API keys despite server-side updates. Console shows:
```
Legacy API keys are disabled
```

## Solution Steps

### 1. Open Browser Developer Tools
- **Chrome/Edge**: F12 or Ctrl+Shift+I
- **Firefox**: F12 or Ctrl+Shift+I
- **Safari**: Cmd+Option+I

### 2. Clear All Storage
**In Chrome/Edge:**
1. Go to Application tab
2. Click "Storage" in left sidebar
3. Click "Clear site data"
4. Check all boxes
5. Click "Clear site data"

**In Firefox:**
1. Go to Storage tab
2. Right-click each storage type
3. Select "Delete All"

### 3. Hard Refresh
- **Windows**: Ctrl+Shift+R
- **Mac**: Cmd+Shift+R
- **Or**: Hold Shift and click refresh button

### 4. Clear Browser Cache Completely
**Chrome/Edge:**
1. Menu → More tools → Clear browsing data
2. Select "All time"
3. Check all boxes
4. Click "Clear data"

**Firefox:**
1. Menu → Options → Privacy & Security
2. Click "Clear Data"
3. Check all boxes
4. Click "Clear"

### 5. Restart Browser
Close browser completely and restart.

### 6. Test
Go to http://localhost:5173/clear-browser-cache.html to test if new API keys are loaded.
EOF

echo "✅ Browser instructions created: browser-cache-clear-instructions.md"

# Step 7: Start server with forced cache busting
echo ""
echo "Step 7: Starting server with cache busting..."
echo "📝 Server will start with:"
echo "   - Forced dependency re-optimization"
echo "   - Cache clearing enabled"
echo "   - Environment variables reloaded"
echo ""
echo "🌐 Open these URLs after clearing browser cache:"
echo "   - Cache Test: http://localhost:5173/clear-browser-cache.html"
echo "   - AR Viewer: http://localhost:5173/"
echo ""
echo "⚠️  IMPORTANT: You MUST clear your browser cache manually!"
echo "    The browser is still using cached legacy API keys."
echo ""

# Export environment variables for the session
export VITE_SUPABASE_URL="https://ncjbwzibnqrbrvicdmec.supabase.co"
export VITE_SUPABASE_ANON_KEY="sb_publishable_nDOtY1UHyrKCWlu2hU2ueg_fRRYs0hA"

# Start with maximum cache clearing
npm run dev -- --port 5173 --force --clearScreen false