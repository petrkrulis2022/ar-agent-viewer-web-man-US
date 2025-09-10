# NeAR Viewer - Augmented Reality Agent Interaction Platform

A cutting-edge augmented reality web application that allows users to discover, interact with, and pay AI agents in real-world locations using blockchain technology.

![NeAR Viewer](https://via.placeholder.com/800x400/8b5cf6/ffffff?text=NeAR+Viewer+AR+Platform)

## 🌟 Features

### 🎥 **Advanced Camera System**

- **Live camera feed** with retry logic for maximum compatibility
- **Full-screen AR view** with professional overlay elements
- **Cross-platform support** for desktop and mobile devices
- **Intelligent error handling** with progressive fallback constraints

### 🛰️ **RTK-Enhanced Location Services**

- **Geodnet RTK integration** for centimeter-level GPS accuracy
- **Real-time positioning** with altitude and precision data
- **Fallback systems** for standard GPS when RTK unavailable
- **Location status indicators** showing accuracy and source

### 🤖 **AR Agent Interactions**

- **Interactive agent overlays** positioned on live camera feed
- **Smart positioning algorithm** distributing agents across view
- **Real-time chat system** with contextual AI responses
- **Voice and video call simulation** for immersive interactions
- **Agent type classification** (Assistant, Creator, Services, Tutor, Game)

### 💰 **Blockchain Integration**

- **ThirdWeb wallet connection** with social login options
- **MetaMask integration** for seamless crypto transactions
- **Multi-chain support** - 5+ blockchain networks
- **USDC stablecoin payments** across EVM testnets
- **QR code generation** for mobile wallet compatibility
- **Auto-chain detection** and switching

### 🌐 **Supported EVM Testnets & USDC Contracts**

| Chain         | Network Name     | Chain ID | USDC Contract Address                        | Explorer                                                               |
| ------------- | ---------------- | -------- | -------------------------------------------- | ---------------------------------------------------------------------- |
| **Ethereum**  | Sepolia          | 11155111 | `0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238` | [sepolia.etherscan.io](https://sepolia.etherscan.io)                   |
| **Arbitrum**  | Arbitrum Sepolia | 421614   | `0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d` | [sepolia-explorer.arbitrum.io](https://sepolia-explorer.arbitrum.io)   |
| **Base**      | Base Sepolia     | 84532    | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` | [sepolia-explorer.base.org](https://sepolia-explorer.base.org)         |
| **Optimism**  | OP Sepolia       | 11155420 | `0x5fd84259d66Cd46123540766Be93DFE6D43130D7` | [sepolia-optimism.etherscan.io](https://sepolia-optimism.etherscan.io) |
| **Avalanche** | Fuji Testnet     | 43113    | `0x5425890298aed601595a70AB815c96711a31Bc65` | [testnet.snowtrace.io](https://testnet.snowtrace.io)                   |

### 🔗 **Additional Blockchain Networks**

| Chain        | Network            | Token  | Amount    | Chain ID |
| ------------ | ------------------ | ------ | --------- | -------- |
| **BlockDAG** | Primordial Testnet | USBDG+ | 50 tokens | 1043     |
| **Morph**    | Holesky Testnet    | USDT   | 1 token   | 2810     |
| **Solana**   | Testnet            | SOL    | 1 token   | -        |
| **Solana**   | Devnet             | USDC   | 1 token   | -        |
| **Hedera**   | Testnet            | HBAR   | 1 token   | -        |

### 💡 **Payment Features**

- **🎯 Revolutionary 3D Cube Interface** - Interactive floating payment system
- **🔄 Auto-chain Detection** - Automatically detects user's wallet chain
- **💱 Smart Chain Selection** - Uses supported chain or suggests alternatives
- **📱 Universal QR Codes** - Compatible with MetaMask, Coinbase Wallet, and more
- **🔐 Secure Transactions** - EIP-681 standard for safe payments
- **⚡ Instant Processing** - Real-time transaction monitoring

### 🗄️ **Database Connectivity**

- **Supabase integration** for real-time agent data
- **43+ agents** loaded from live database
- **GPS coordinate mapping** for accurate AR positioning
- **Dynamic agent discovery** based on user location

## 🚀 **Technology Stack**

### **Frontend**

- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Professional component library
- **Lucide React** - Beautiful icon system

### **Blockchain**

- **ThirdWeb SDK** - Web3 development platform
- **MetaMask** - Ethereum wallet integration
- **BlockDAG Network** - High-performance blockchain
- **EIP-681** - Payment URI standard

### **Location Services**

- **Geodnet RTK** - Real-time kinematic positioning
- **Web Geolocation API** - Standard GPS fallback
- **NTRIP Protocol** - RTK correction data streaming

### **Database**

- **Supabase** - Real-time PostgreSQL database
- **Real-time subscriptions** - Live data updates
- **Row Level Security** - Secure data access

## 📦 **Installation**

### **Prerequisites**

- Node.js 18+
- pnpm (recommended) or npm
- Modern web browser with camera support

### **Setup**

```bash
# Clone the repository
git clone https://github.com/your-username/ar-viewer-web.git
cd ar-viewer-web

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials
```

### **Environment Variables**

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ThirdWeb Configuration
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
VITE_THIRDWEB_SECRET_KEY=your_thirdweb_secret_key

# RTK Geodnet Configuration
VITE_RTK_HOST=rtk.geodnet.com
VITE_RTK_PORT=2101
VITE_RTK_MOUNTPOINT=AUTO
VITE_RTK_USERNAME=your_geodnet_username
VITE_RTK_PASSWORD=your_geodnet_password

# Assembly AI (for voice features)
VITE_ASSEMBLY_AI_API_KEY=your_assembly_ai_key
```

### **Development**

```bash
# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🎯 **Usage**

### **Getting Started**

1. **Open the application** in a modern web browser
2. **Allow location access** for GPS positioning
3. **Grant camera permissions** for AR functionality
4. **Wait for initialization** (Location → Camera → Database)

### **AR Agent Interaction**

1. **Start the camera** using the "Start Camera" button
2. **Look for colored agent markers** overlaid on the camera feed
3. **Tap any agent** to open the interaction modal
4. **Choose interaction type**: Chat, Voice, Video, or Payment

### **Wallet Connection**

1. **Navigate to Wallet tab** in the main interface
2. **Click "Connect Wallet"** to open connection modal
3. **Choose connection method**: MetaMask, Social Login, or Email
4. **Complete authentication** process
5. **Start making payments** to agents with USDFC tokens

### **RTK Location Enhancement**

- **Automatic RTK detection** when Geodnet credentials configured
- **Real-time accuracy display** showing positioning precision
- **Altitude information** included in location data
- **Fallback to standard GPS** when RTK unavailable

## 🏗️ **Architecture**

### **Component Structure**

```
src/
├── components/
│   ├── ARViewer.jsx              # Main application component
│   ├── CameraView.jsx            # Camera feed and controls
│   ├── ARAgentOverlay.jsx        # Agent positioning and display
│   ├── AgentInteractionModal.jsx # Chat and interaction interface
│   ├── ThirdWebWalletConnect.jsx # Wallet connection UI
│   └── PaymentQRModal.jsx        # QR code payment interface
├── hooks/
│   └── useDatabase.js            # Supabase database integration
├── services/
│   └── rtkLocation.js            # RTK positioning service
├── providers/
│   └── ThirdWebProvider.jsx     # Blockchain provider wrapper
└── config/
    └── blockdag-chain.js         # Blockchain network configuration
```

### **Data Flow**

1. **Location Service** → RTK-enhanced GPS coordinates
2. **Database Service** → Agent data with GPS positions
3. **AR Overlay** → Positioned agents on camera feed
4. **Interaction System** → Chat, voice, video, payments
5. **Blockchain** → Wallet connection and transactions

## 🔧 **Configuration**

### **Supabase Database Schema**

```sql
-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  agent_type TEXT NOT NULL,
  description TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  altitude DECIMAL(8, 2),
  distance_meters INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### **BlockDAG Network**

- **Chain ID**: 1043
- **Network Name**: BlockDAG Primordial Testnet
- **RPC URL**: https://rpc-testnet.blockdag.org
- **Explorer**: https://explorer-testnet.blockdag.org
- **Native Token**: BDAG

### **RTK Configuration**

- **Provider**: Geodnet
- **Protocol**: NTRIP
- **Accuracy**: 2cm (when RTK signal available)
- **Coverage**: Global RTK correction network

## 🚀 **Deployment**

### **Branch Structure**

- **`main`** - Stable release with full AR system
- **`Cube-Crypto-QR`** - Development branch for enhanced crypto payments

### **3D Cube Payment Development**

The `Cube-Crypto-QR` branch contains the revolutionary 3D floating payment cube interface with:

- **🎯 Interactive 3D Cube** - 6 payment method faces with click/touch support
- **📱 Enhanced Crypto QR** - Direct AR QR display without modals
- **🔄 Chain Autodetection** - Automatically detects and uses optimal blockchain
- **💰 USDC Focus** - Simplified payments using USDC across all EVM chains
- **🌟 AR Integration** - QR codes appear directly in AR space

### **Static Hosting**

```bash
# Build for production
pnpm run build

# Deploy dist/ folder to your hosting provider
# Supports: Vercel, Netlify, GitHub Pages, etc.
```

### **Environment Setup**

- Configure environment variables in hosting platform
- Ensure HTTPS for camera and location access
- Set up proper CORS headers for API access

## 🤝 **Contributing**

### **Development Workflow**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### **Code Standards**

- **ESLint** for code linting
- **Prettier** for code formatting
- **React best practices** for component development
- **Responsive design** for mobile compatibility

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **ThirdWeb** - Web3 development platform
- **Supabase** - Real-time database infrastructure
- **Geodnet** - RTK positioning network
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework

## 📞 **Support**

- **Documentation**: [docs.NeAR-viewer.app](https://docs.NeAR-viewer.app)
- **Issues**: [GitHub Issues](https://github.com/your-username/ar-viewer-web/issues)
- **Discord**: [NeAR Viewer Community](https://discord.gg/NeAR-viewer)
- **Email**: support@NeAR-viewer.app

---

**Built with ❤️ for the future of augmented reality and blockchain interaction**
