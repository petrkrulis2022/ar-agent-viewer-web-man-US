#!/bin/bash

# AgentSphere Repository Organization Script
# Organizes markdown files, scripts, database queries, and testing files
# Similar to Hedera codebase organization structure

echo "🚀 Starting AgentSphere Repository Organization..."

# Create organized directory structure (already created by script)
echo "✅ Directory structure created"

# Move Development Reports
echo "📊 Moving development reports..."
mv "DYNAMIC_FEES_COINBASE_DEVELOPMENT_REPORT.md" "docs/development-reports/" 2>/dev/null
mv "DEVELOPMENT_REPORT_OCT_2025.md" "docs/development-reports/" 2>/dev/null
mv "SUPABASE_API_KEY_SECURITY_INCIDENT_REPORT.md" "docs/security/" 2>/dev/null
mv "COMPREHENSIVE_BRANCH_ANALYSIS.md" "docs/development-reports/" 2>/dev/null
mv "BRANCH_ANALYSIS_REPORT.md" "docs/development-reports/" 2>/dev/null

# Move Integration Guides
echo "🔧 Moving integration guides..."
mv "AGENTSPHERE_SOLANA_IMPLEMENTATION_GUIDE.md" "docs/integration-guides/" 2>/dev/null
mv "AGENTSPHERE_SOLANA_WALLET_INTEGRATION_PROMPT.md" "docs/integration-guides/" 2>/dev/null
mv "AGENTSPHERE_NON_EVM_WALLET_INTEGRATION_PROMPT.md" "docs/integration-guides/" 2>/dev/null
mv "HEDERA_AR_VIEWER_INTEGRATION_PROMPT.md" "docs/integration-guides/" 2>/dev/null
mv "CCIP_INSTALLATION_GUIDE_FOR_COPILOT.md" "docs/integration-guides/" 2>/dev/null
mv "BLOCKCHAIN_QR_INTEGRATION_GUIDE.md" "docs/integration-guides/" 2>/dev/null

# Move System Documentation
echo "📋 Moving system documentation..."
mv "DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md" "docs/" 2>/dev/null
mv "PAYMENT_CUBE_SYSTEM_DOCUMENTATION.md" "docs/" 2>/dev/null
mv "IMPLEMENTATION_SUMMARY.md" "docs/" 2>/dev/null
mv "WALLET_INTEGRATION_FIXES_SUMMARY.md" "docs/" 2>/dev/null

# Move Testing Documentation
echo "🧪 Moving testing documentation..."
mv "3D_MODELS_TESTING_GUIDE.md" "docs/testing/" 2>/dev/null
mv "AR_CUBE_VIRTUAL_CARD_TESTING.md" "docs/testing/" 2>/dev/null
mv "BANK_QR_TESTING_INSTRUCTIONS.md" "docs/testing/" 2>/dev/null
mv "AR_VIEWER_FEE_VALIDATION_GUIDE.md" "docs/testing/" 2>/dev/null
mv "REVOLUT_MOCK_MODE_TESTING_GUIDE.md" "docs/testing/" 2>/dev/null

# Move Deployment Documentation
echo "🚀 Moving deployment documentation..."
mv "NETLIFY_ENV_SETUP.md" "docs/deployment/" 2>/dev/null
mv "MOBILE_DEPLOYMENT.md" "docs/deployment/" 2>/dev/null
mv "SUPABASE_SETUP.md" "docs/deployment/" 2>/dev/null

# Move Feature Implementation Reports
echo "🎯 Moving feature reports..."
mv "CUBE_PAYMENT_ENGINE_DEVELOPMENT.md" "docs/development-reports/" 2>/dev/null
mv "CUBE_VISUAL_ENHANCEMENT_COMPLETE.md" "docs/development-reports/" 2>/dev/null
mv "3D_MODELS_IMPLEMENTATION_SUMMARY.md" "docs/development-reports/" 2>/dev/null
mv "AR_CUBE_PAYMENT_IMPLEMENTATION_COMPLETE.md" "docs/development-reports/" 2>/dev/null
mv "BANK_QR_INTERNAL_PAYMENT_IMPLEMENTATION.md" "docs/development-reports/" 2>/dev/null

# Move Integration Summary Reports
echo "📈 Moving integration summaries..."
mv "AGENTSPHERE_POLYGON_SOLANA_INTEGRATION_SUMMARY.md" "docs/development-reports/" 2>/dev/null
mv "AGENTSPHERE_INTEGRATION_COMPLETE.md" "docs/development-reports/" 2>/dev/null
mv "AGENTSPHERE_ENHANCED_ALIGNMENT_REPORT.md" "docs/development-reports/" 2>/dev/null
mv "CCIP_AND_QR_DEVELOPMENT_COMPREHENSIVE_SUMMARY.md" "docs/development-reports/" 2>/dev/null

# Move Status and Fix Reports
echo "🔄 Moving status reports..."
mv "CURRENT_STATUS.md" "docs/" 2>/dev/null
mv "DATABASE_FIX_COMPLETE.md" "docs/development-reports/" 2>/dev/null
mv "MARKETPLACE_FIXES_COMPLETED.md" "docs/development-reports/" 2>/dev/null
mv "PAYMENT_MODAL_FIX_COMPLETE.md" "docs/development-reports/" 2>/dev/null
mv "AR_QR_FIX_SUMMARY.md" "docs/development-reports/" 2>/dev/null
mv "AR_VIEWER_FEE_DISPLAY_FIX_SUMMARY.md" "docs/development-reports/" 2>/dev/null
mv "COMPLETE_AR_QR_FIX_STATUS.md" "docs/development-reports/" 2>/dev/null

# Move Business Logic Documentation
echo "💼 Moving business documentation..."
mv "AGENT_CARDS_WALLET_INTEGRATION.md" "docs/" 2>/dev/null
mv "DYNAMIC_PAYMENT_VERIFICATION.md" "docs/" 2>/dev/null
mv "PAYMENT_TERMINAL_REDIRECT_SYSTEM.md" "docs/" 2>/dev/null
mv "MULTI_TENANT_REVOLUT_PAYMENT_ROUTING.md" "docs/" 2>/dev/null

# Move Database Files
echo "🗄️ Moving database files..."
mv *.sql "database/queries/" 2>/dev/null
mv "agentsphere-full-web-man-US/*.sql" "database/migrations/" 2>/dev/null
mv "sql/*.sql" "database/migrations/" 2>/dev/null

# Move specific debugging SQL files
mv "database/queries/debug-*.sql" "database/debugging/" 2>/dev/null
mv "database/queries/delete-*.sql" "database/debugging/" 2>/dev/null

# Move Scripts
echo "🔧 Moving scripts..."
mv *.mjs "scripts/" 2>/dev/null
mv *.cjs "scripts/" 2>/dev/null
mv test-*.js "scripts/testing/" 2>/dev/null
mv debug-*.js "scripts/testing/" 2>/dev/null
mv setup-*.js "scripts/deployment/" 2>/dev/null
mv setup-*.mjs "scripts/deployment/" 2>/dev/null

# Move database scripts specifically
mv "scripts/query-*.mjs" "scripts/database/" 2>/dev/null
mv "scripts/list-*.mjs" "scripts/database/" 2>/dev/null
mv "scripts/check-*.mjs" "scripts/database/" 2>/dev/null
mv "scripts/comprehensive-*.mjs" "scripts/database/" 2>/dev/null
mv "scripts/investigate-*.mjs" "scripts/database/" 2>/dev/null
mv "scripts/validate-*.mjs" "scripts/database/" 2>/dev/null

# Move testing HTML files
echo "🌐 Moving testing HTML files..."
mv *.html "testing/html-tools/" 2>/dev/null

# Move config files to scripts
echo "⚙️ Moving configuration files..."
mv "agentsphere-*.js" "scripts/" 2>/dev/null
mv "*config*.js" "scripts/" 2>/dev/null
mv "analyze_*.cjs" "scripts/" 2>/dev/null
mv "comprehensive_*.cjs" "scripts/" 2>/dev/null

# Move specific utility files
mv "apply_*.js" "scripts/database/" 2>/dev/null
mv "*migration*.js" "scripts/database/" 2>/dev/null

# Create index files for documentation
echo "📝 Creating documentation index..."

cat > "docs/README.md" << 'EOF'
# 📚 AgentSphere Documentation

This directory contains comprehensive documentation for the AgentSphere AR Agent Viewer project.

## 📁 Directory Structure

### 🚀 `/development-reports/`
Contains all development progress reports, feature implementation summaries, and project milestone documentation.

### 🔧 `/integration-guides/`  
Step-by-step guides for integrating various blockchain networks, wallets, and payment systems.

### 🔒 `/security/`
Security incident reports, vulnerability assessments, and security implementation documentation.

### 🧪 `/testing/`
Testing guides, validation procedures, and quality assurance documentation.

### 📦 `/deployment/`
Deployment guides, environment setup instructions, and production configuration documentation.

## 🎯 Core System Documentation

- `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md` - Complete payment system architecture
- `PAYMENT_CUBE_SYSTEM_DOCUMENTATION.md` - 3D payment interface documentation  
- `IMPLEMENTATION_SUMMARY.md` - High-level implementation overview
- `CURRENT_STATUS.md` - Current project status and roadmap

## 🔍 Quick Navigation

- **Payment System**: See `DYNAMIC_PAYMENT_SYSTEM_DOCUMENTATION.md`
- **3D Interface**: See `PAYMENT_CUBE_SYSTEM_DOCUMENTATION.md`
- **Blockchain Integration**: See `/integration-guides/`
- **Security Reports**: See `/security/`
- **Testing Procedures**: See `/testing/`
- **Development Progress**: See `/development-reports/`

---

*Generated automatically by repository organization script*
EOF

# Create scripts index
cat > "scripts/README.md" << 'EOF'
# 🔧 AgentSphere Scripts

This directory contains all utility scripts, database management tools, and testing utilities.

## 📁 Directory Structure

### 🗄️ `/database/`
Database management scripts, query utilities, and data validation tools.

### 🧪 `/testing/`
Testing scripts, mock data generators, and validation utilities.

### 🚀 `/deployment/`
Deployment scripts, environment setup tools, and configuration utilities.

## 🛠️ Script Categories

### Database Management
- Agent query and management scripts
- Wallet integration utilities  
- Payment terminal management
- Data validation and debugging

### Testing & Validation
- Mock data generation
- Service testing utilities
- Integration testing tools
- Performance validation scripts

### Deployment & Configuration
- Environment setup scripts
- Configuration management
- Build and deployment utilities

## 📋 Usage Instructions

Most scripts are Node.js modules (.mjs) that can be run with:
```bash
node script-name.mjs
```

For testing utilities:
```bash
node scripts/testing/test-script.mjs
```

---

*Generated automatically by repository organization script*
EOF

# Create database index
cat > "database/README.md" << 'EOF'
# 🗄️ AgentSphere Database

This directory contains all database-related files including migrations, queries, and debugging tools.

## 📁 Directory Structure

### 📋 `/migrations/`
Database schema migrations and structural updates.

### 🔍 `/queries/`
Utility queries for data management and analysis.

### 🐛 `/debugging/`
Debugging queries and troubleshooting SQL scripts.

## 🎯 Key Database Components

### Schema Files
- Multi-blockchain support schema
- AR QR codes table structure
- Payment terminal configurations
- Wallet integration tables

### Migration Files
- Network constraint fixes
- Fee structure updates
- Wallet address integration
- Payment method configurations

### Debugging Tools
- Agent investigation queries
- Payment terminal debugging
- Network validation scripts
- Data consistency checks

## 🔧 Usage

Run migrations in order using your database client or migration tool.
Use debugging queries to troubleshoot specific issues.
Query utilities help with data analysis and reporting.

---

*Generated automatically by repository organization script*
EOF

# Create testing index
cat > "testing/README.md" << 'EOF'
# 🧪 AgentSphere Testing

This directory contains all testing utilities, HTML debugging tools, and validation resources.

## 📁 Directory Structure

### 🌐 `/html-tools/`
HTML testing utilities for debugging web components and services.

## 🛠️ Testing Categories

### HTML Testing Tools
- Database connection testing
- Payment modal debugging
- Agent network inspection
- USDC balance validation
- Cross-chain detection testing

### Component Testing
- AR viewer functionality
- Payment cube interaction
- Wallet connectivity
- Blockchain integration

### Service Testing
- API endpoint validation
- Database query testing
- Payment processing verification
- Network connectivity checks

## 📋 Usage Instructions

HTML tools can be opened directly in a web browser:
```bash
# Open testing tool in browser
open testing/html-tools/database-connection-test.html
```

For local development server:
```bash
# Serve testing tools locally
python -m http.server 8000
# Then visit http://localhost:8000/testing/html-tools/
```

---

*Generated automatically by repository organization script*
EOF

echo "✅ Repository organization complete!"
echo ""
echo "📁 New Directory Structure:"
echo "├── docs/"
echo "│   ├── development-reports/"
echo "│   ├── integration-guides/"
echo "│   ├── security/"
echo "│   ├── testing/"
echo "│   └── deployment/"
echo "├── scripts/"
echo "│   ├── database/"
echo "│   ├── testing/"
echo "│   └── deployment/"
echo "├── database/"
echo "│   ├── migrations/"
echo "│   ├── queries/"
echo "│   └── debugging/"
echo "└── testing/"
echo "    └── html-tools/"
echo ""
echo "🎯 All files have been organized by category and purpose!"
echo "📚 Documentation indexes created for easy navigation."