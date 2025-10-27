#!/bin/bash
echo "🚨 EMERGENCY AR VIEWER FIX"
echo "=========================="
echo ""

# Kill all running servers
echo "1. Stopping all Vite servers..."
pkill -f "vite" 2>/dev/null
sleep 2

# Clear all caches
echo "2. Clearing all caches..."
rm -rf node_modules/.vite
rm -rf dist
rm -rf .vite

# Verify environment
echo "3. Checking environment..."
if grep -q "sb_publishable" .env; then
    echo "✅ New API keys present in .env"
else
    echo "❌ WARNING: Old API keys in .env"
fi

# Restart server with force flag
echo "4. Starting AR Viewer with fresh cache..."
echo ""
echo "🌐 Opening: http://localhost:5173/"
echo ""
echo "⚠️  CRITICAL: You MUST restart your browser for this to work!"
echo ""

npm run dev -- --port 5173 --force --clearScreen false
