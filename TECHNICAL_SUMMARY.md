# AR Agent Viewer Web - Technical Summary & API Documentation

**Project:** AR Agent Viewer Web (US Market QR Integration)  
**Date:** August 25, 2025  
**Repository:** ar-agent-viewer-web-man-US  
**Environment:** Development (localhost:5173)

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     AR AGENT VIEWER WEB                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend Layer (React + Vite)                                 │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   AR/3D Engine  │ │  Wallet Manager │ │   QR Generator  │   │
│  │  (Three.js)     │ │ (Multi-chain)   │ │  (Multi-format) │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Service Layer                                                  │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │ Payment Processor│ │   QR Service    │ │   AR Manager    │   │
│  │  (Multi-chain)  │ │  (EIP-681/SPay) │ │  (Positioning)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Blockchain Integration Layer                                   │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Hedera  │ │ Solana  │ │  Morph  │ │BlockDAG │ │Ethereum │   │
│  │Testnet  │ │Mainnet  │ │Holesky  │ │Testnet  │ │Mainnet  │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  Data Layer                                                     │
│  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐   │
│  │   Supabase DB   │ │  Local Storage  │ │   Blockchain    │   │
│  │  (PostgreSQL)   │ │   (Browser)     │ │  (Distributed)  │   │
│  └─────────────────┘ └─────────────────┘ └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 🛠️ Technical Stack

### **Core Technologies**

```javascript
{
  "runtime": "Node.js 18+",
  "framework": "React 19.1.0",
  "bundler": "Vite 6.3.5",
  "language": "JavaScript (ES2022)",
  "styling": "Tailwind CSS 4.1.7",
  "3d_engine": "Three.js 0.178.0",
  "ui_library": "Radix UI Components",
  "package_manager": "pnpm 10.4.1"
}
```

### **Blockchain Libraries**

```javascript
{
  "ethereum": {
    "thirdweb": "5.105.16",
    "thirdweb_react": "4.9.4"
  },
  "solana": {
    "web3js": "1.98.2",
    "wallet_adapter": "0.15.39",
    "spl_token": "0.4.13"
  },
  "multi_chain": {
    "wallet_connect": "MetaMask integration",
    "payment_standards": ["EIP-681", "Solana Pay"]
  }
}
```

### **Database & Backend**

```javascript
{
  "database": "Supabase PostgreSQL",
  "real_time": "Supabase Subscriptions",
  "authentication": "Supabase Auth",
  "storage": "Supabase Storage",
  "connection": "https://ncjbwzibnqrbrvicdmec.supabase.co"
}
```

---

## 📡 API Documentation

### **1. QR Code Service API** (`src/services/qrCodeService.js`)

#### **Core Methods**

```javascript
/**
 * Generate AR QR Code for multi-blockchain payments
 * @param {number} amount - Payment amount in USD
 * @param {string} recipient - Wallet address to receive payment
 * @param {string} blockchain - Target blockchain
 * @param {string} agentName - Agent name for transaction reference
 * @returns {Promise<Object>} QR code data and transaction info
 */
async generateARQRCode(amount, recipient, blockchain, agentName)

/**
 * Create QR positioning for AR space
 * @param {number} index - QR code index
 * @param {number} total - Total number of QR codes
 * @returns {Object} Position coordinates {x, y, z}
 */
createQRPosition(index, total)

/**
 * Update QR code status in database
 * @param {string} qrId - QR code identifier
 * @param {string} status - New status ('pending', 'scanned', 'completed', 'failed')
 * @param {Object} additionalData - Extra status data
 */
async updateQRCodeStatus(qrId, status, additionalData)
```

#### **Response Format**

```javascript
{
  "qrCodeData": "ethereum:0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98@2810/transfer?address=0x1234...&uint256=1000000000000000000",
  "transactionId": "tx_1738174800000_ai_assistant",
  "blockchain": "morph",
  "amount": 1000000000000000000,
  "recipient": "0x1234...",
  "metadata": {
    "agentName": "AI Assistant",
    "timestamp": 1738174800000,
    "chainId": "2810"
  }
}
```

### **2. Payment Processor API** (`src/services/paymentProcessor.js`)

#### **Core Methods**

```javascript
/**
 * Process QR code payment across multiple blockchains
 * @param {Object} qrData - QR code data containing payment URI
 * @returns {Promise<Object>} Transaction result
 */
async processQRPayment(qrData)

/**
 * Parse payment URI (supports EIP-681 and Solana Pay)
 * @param {string} paymentUri - Payment URI from QR code
 * @returns {Object} Parsed payment details
 */
parsePaymentURI(paymentUri)

/**
 * Switch to correct blockchain network
 * @param {number} chainId - Target chain ID
 * @returns {Promise<void>}
 */
async switchToNetwork(chainId)

/**
 * Execute blockchain transaction
 * @param {Object} paymentDetails - Payment details from parsed URI
 * @returns {Promise<Object>} Transaction hash and receipt
 */
async executeTransaction(paymentDetails)
```

#### **Supported Networks**

```javascript
const SUPPORTED_NETWORKS = {
  1043: {
    name: "BlockDAG Primordial Testnet",
    chainId: "0x413",
    rpc: "https://testnet-rpc.primordial.network",
    explorer: "https://test-explorer.primordial.bdagscan.com/",
  },
  2810: {
    name: "Morph Holesky Testnet",
    chainId: "0xAFA",
    rpc: "https://rpc-quicknode-holesky.morphl2.io",
    explorer: "https://explorer-holesky.morphl2.io",
  },
  296: {
    name: "Hedera Testnet",
    chainId: "0x128",
    rpc: "https://testnet.hashio.io/api",
    explorer: "https://hashscan.io/testnet",
  },
};
```

### **3. Supabase Database API** (`src/lib/supabase.js`)

#### **Core Methods**

```javascript
/**
 * Get NeAR agents from Supabase with location filtering
 * @param {number} latitude - User latitude
 * @param {number} longitude - User longitude
 * @param {number} radius - Search radius in meters
 * @returns {Promise<Array>} Array of agent objects
 */
async getNearAgentsFromSupabase(latitude, longitude, radius = 100)

/**
 * Test database connection and table availability
 * @returns {Promise<boolean|string>} Connection status
 */
async testConnection()

/**
 * Get connection health status
 * @returns {Promise<Object>} Connection status and latency
 */
async getConnectionStatus()
```

#### **Database Schema**

```sql
-- deployed_objects table (agents)
CREATE TABLE deployed_objects (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  altitude DOUBLE PRECISION,
  agent_type TEXT,
  user_id TEXT,
  token_address TEXT,
  chain_id TEXT,
  deployer_wallet_address TEXT,
  interaction_fee DECIMAL,
  currency_type TEXT DEFAULT 'USDT',
  network TEXT DEFAULT 'Morph',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ar_qr_codes table (QR tracking)
CREATE TABLE ar_qr_codes (
  id UUID PRIMARY KEY,
  agent_id UUID REFERENCES deployed_objects(id),
  payment_uri TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  transaction_hash TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  scanned_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### **4. Blockchain-Specific Services**

#### **Morph Payment Service** (`src/services/morphPaymentService.js`)

```javascript
/**
 * Generate Morph agent payment data
 * @param {Object} agent - Agent object from database
 * @param {number} amount - Payment amount in USDT
 * @returns {Promise<Object>} Payment information
 */
async generateMorphAgentPayment(agent, amount = 1)

/**
 * Generate Morph payment QR data (EIP-681 format)
 * @param {Object} paymentInfo - Payment information
 * @returns {string} EIP-681 formatted payment URI
 */
generateMorphPaymentQRData(paymentInfo)

// Token Configuration
const MorphUSDTToken = {
  address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98",
  symbol: "USDT",
  decimals: 18
}
```

#### **Hedera Wallet Service** (`src/services/hederaWalletService.js`)

```javascript
/**
 * Connect to Hedera wallet via MetaMask
 * @returns {Promise<string>} Connected wallet address
 */
async connectHederaWallet()

/**
 * Get HBAR balance for connected wallet
 * @param {string} walletAddress - Wallet address
 * @returns {Promise<number>} HBAR balance
 */
async getHBARBalance(walletAddress)

/**
 * Generate Hedera payment QR data
 * @param {Object} paymentData - Payment information
 * @returns {string} Ethereum-compatible payment URI
 */
generateHederaPaymentQRData(paymentData)
```

#### **Solana Payment Service** (`src/services/solanaPaymentService.js`)

```javascript
/**
 * Generate Solana Pay URL
 * @param {Object} agent - Agent object
 * @param {number} amount - Payment amount in SOL
 * @returns {Promise<Object>} Solana Pay data
 */
async generateSolanaAgentPayment(agent, amount = 0.01)

/**
 * Create Solana Pay QR code
 * @param {Object} paymentInfo - Payment information
 * @returns {string} Solana Pay URL
 */
generateSolanaPaymentQRData(paymentInfo)
```

---

## 🎨 Component API Documentation

### **1. UnifiedWalletConnect Component**

```javascript
// Props Interface
interface UnifiedWalletConnectProps {
  onConnectionChange?: (connectionData: Object) => void;
}

// Connection Data Format
{
  blockchain: string,
  connected: boolean,
  accountId?: string,
  networkId?: string,
  walletType: string
}
```

### **2. EnhancedPaymentQRModal Component**

```javascript
// Props Interface
interface EnhancedPaymentQRModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  amount: number;
  onPaymentSuccess?: (transactionData: Object) => void;
}

// Methods
const handleBlockchainSelect = (blockchain) => {
  /* Network selection */
};
const generateQRCode = async (blockchain) => {
  /* QR generation */
};
const startPaymentMonitoring = (transactionId) => {
  /* Payment tracking */
};
```

### **3. AR3DScene Component**

```javascript
// Props Interface
interface AR3DSceneProps {
  agents: Array<Object>;
  onAgentSelect?: (agent: Object) => void;
  cameraPosition?: [number, number, number];
}

// Agent Object Format
{
  id: string,
  name: string,
  position: [x, y, z],
  model_url: string,
  scale: [x, y, z],
  rotation: [x, y, z]
}
```

---

## 🔄 Data Flow Diagrams

### **Payment Processing Flow**

```
User Scans QR → Parse Payment URI → Validate Data → Connect Wallet
     ↓              ↓                    ↓             ↓
Switch Network → Execute Transaction → Monitor Status → Update Database
     ↓              ↓                    ↓             ↓
Show Success → Open Explorer → Log Result → Notify User
```

### **Agent Discovery Flow**

```
Get Location → Query Supabase → Filter by Distance → Render in AR
     ↓              ↓               ↓                 ↓
Load 3D Models → Position Agents → Add Interactions → Display UI
```

### **QR Code Generation Flow**

```
Select Agent → Choose Blockchain → Get Wallet Address → Calculate Amount
     ↓              ↓                    ↓                 ↓
Generate URI → Create QR Code → Position in AR → Monitor Scanning
```

---

## 🔐 Security & Authentication

### **Wallet Security**

```javascript
// Wallet connection validation
const validateWalletConnection = async () => {
  if (!window.ethereum) throw new Error("Wallet not detected");

  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });

  if (!accounts?.length) throw new Error("No accounts found");
  return accounts[0];
};
```

### **Transaction Security**

```javascript
// Payment data validation
const validatePaymentData = (qrData) => {
  const required = ["payment_uri", "amount", "recipient"];
  const missing = required.filter((field) => !qrData[field]);

  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
};
```

---

## 🚀 Performance Metrics

### **Load Times**

- **Initial App Load:** ~2.5s (with code splitting)
- **3D Model Loading:** ~1-3s per model
- **QR Generation:** ~100-300ms
- **Database Queries:** ~200-500ms

### **Bundle Size**

```javascript
{
  "total_bundle": "2.1MB",
  "main_chunk": "850KB",
  "vendor_chunk": "1.2MB",
  "assets": "50KB"
}
```

### **Optimization Strategies**

- **Code Splitting:** Dynamic imports for wallet adapters
- **Lazy Loading:** 3D models loaded on demand
- **Caching:** Service worker for static assets
- **Tree Shaking:** Unused code elimination

---

## 🔧 Development Environment

### **Local Development Setup**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Available at: http://localhost:5173/
```

### **Environment Variables**

```bash
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Build Configuration** (`vite.config.js`)

```javascript
export default defineConfig({
  plugins: [react()],
  define: {
    global: "globalThis",
  },
  optimizeDeps: {
    include: ["buffer"],
  },
});
```

---

## 🧪 Testing & Debugging

### **Available Test Scripts**

```bash
# Comprehensive AR QR flow test
node src/utils/comprehensiveARQRFlowTest.js

# Database connection test
node test-database-connection.js

# Direct database test
node test-direct-db.js

# Real database test
node test-real-database.js
```

### **Browser Testing**

```html
<!-- test-agents-browser.html -->
<!-- Complete browser-based testing interface -->
```

### **Debug Utilities**

```javascript
// Supabase configuration debug
debugSupabaseConfig();

// QR format testing
const testFormats = generateMultipleQRFormats(paymentInfo);
console.log("Test formats:", testFormats);

// Wallet compatibility check
const compatible = await checkWalletCompatibility();
```

---

## 📋 AgentSphere Integration

### **Data Synchronization**

- **Shared Database:** Common Supabase project for agent data
- **Real-time Updates:** Live synchronization via Supabase subscriptions
- **Schema Compatibility:** Aligned data models across platforms

### **API Compatibility**

- **RESTful Endpoints:** Compatible with AgentSphere backend
- **Authentication Flow:** Unified user sessions
- **Asset Management:** Shared agent metadata and 3D models

### **Integration Points**

```javascript
// Agent data sync
const syncWithAgentSphere = async () => {
  const { data } = await supabase
    .from("deployed_objects")
    .select("*")
    .eq("is_active", true);

  return data.map((agent) => ({
    ...agent,
    // Add AR-specific properties
    model_url: getDefaultModel(agent.agent_type),
    ar_scale: [1.0, 1.0, 1.0],
    ar_position: calculateARPosition(agent),
  }));
};
```

---

## 📈 Future Roadmap

### **Immediate Priorities**

1. **Production Deployment:** AWS/Vercel deployment setup
2. **Mobile AR:** WebXR support for native AR experiences
3. **Performance:** Bundle optimization and code splitting
4. **Security Audit:** Comprehensive security review

### **Enhanced Features**

1. **Multi-Token Support:** Multiple tokens per network
2. **Real-time Pricing:** Dynamic token price updates
3. **Transaction History:** Payment tracking and history
4. **Analytics:** User behavior insights and metrics

### **Technical Improvements**

1. **Web Workers:** Background QR generation
2. **Service Workers:** Offline functionality
3. **WebRTC:** Peer-to-peer agent interactions
4. **GraphQL:** Optimized data fetching

---

_This technical summary provides comprehensive API documentation, system architecture, and integration details for the AR Agent Viewer Web project as of August 25, 2025._
