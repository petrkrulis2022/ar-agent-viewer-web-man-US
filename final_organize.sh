#!/bin/bash

# Final organization script for remaining markdown files
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"

echo "🔄 Organizing remaining markdown files..."

# Move Revolut-related development files
mv REVOLUT_*.md docs/development-reports/ 2>/dev/null

# Move Payment Modal development files  
mv PAYMENT_MODAL_*.md docs/development-reports/ 2>/dev/null

# Move QR System development files
mv QR_*.md docs/development-reports/ 2>/dev/null

# Move Integration reports
mv *INTEGRATION*.md docs/development-reports/ 2>/dev/null

# Move Virtual Terminal files
mv VIRTUAL_*.md docs/development-reports/ 2>/dev/null

# Move Enhancement reports
mv ENHANCED_*.md docs/development-reports/ 2>/dev/null

# Move Network-specific implementation files
mv POLYGON_*.md docs/development-reports/ 2>/dev/null
mv HEDERA_*.md docs/development-reports/ 2>/dev/null

# Move Contract and Address updates
mv USDC_*.md docs/development-reports/ 2>/dev/null

# Move Cube development files
mv CUBE_*.md docs/development-reports/ 2>/dev/null

# Move AgentSphere-specific files
mv AGENTSPHERE_*.md docs/development-reports/ 2>/dev/null

# Move Summary files
mv TECHNICAL_*.md docs/development-reports/ 2>/dev/null
mv PROJECT_*.md docs/development-reports/ 2>/dev/null
mv RECENT_*.md docs/development-reports/ 2>/dev/null

# Move Workspace files
mv MULTI_*.md docs/development-reports/ 2>/dev/null

# Move Terminal debugging session
mv PAYMENT_TERMINAL_*.md docs/development-reports/ 2>/dev/null

echo "✅ Final organization complete!"