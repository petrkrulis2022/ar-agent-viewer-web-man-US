# Changelog

All notable changes to the AR Viewer project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.1] - 2025-01-30

### 📚 Documentation

- **Added** comprehensive `docs/Schemas.md` with complete database documentation
  - All table schemas with field descriptions and constraints
  - TypeScript interfaces for data models
  - Database functions and triggers
  - Security policies (RLS) documentation
  - Performance indexes and optimization
  - Common queries and migration scripts
- **Added** complete `docs/API_Documentation.md` with full API coverage
  - Service APIs for QR code generation and payment processing
  - Component APIs with Props interfaces
  - Database hooks and functions
  - Blockchain configuration APIs
  - Authentication and WebSocket documentation
  - Response codes and rate limiting
- **Enhanced** `docs/Memory.md` with updated task completion status
- **Enhanced** `docs/Changelog.md` with documentation completion record

### 🗂️ Project Structure

- **Completed** comprehensive documentation system as requested
- **Organized** all documentation in structured `docs/` folder
- **Improved** maintainability with complete API and schema documentation

---

## [1.3.0] - 2025-07-30

### Added

- **Morph Holesky Testnet Integration**
  - MetaMask wallet support for Morph Holesky (Chain ID: 2810)
  - USDT token payments (1 USDT per transaction)
  - Dynamic recipient address detection from connected wallet
  - EIP-681 compliant QR code generation for token transfers
- **Documentation System**
  - Comprehensive blockchain integration guide (`BLOCKCHAIN_QR_INTEGRATION_GUIDE.md`)
  - Task management memory bank (`Memory.md`)
  - Structured `/docs` folder organization
- **Enhanced Payment Modal**
  - Three-network selection (BlockDAG, Solana, Morph)
  - Network-specific payment instructions
  - Multiple QR format generation for compatibility testing

### Changed

- **QR Code Generation**
  - Fixed QR format to use contract address first for token transfers
  - Updated USDT configuration to use 18 decimals (Morph Holesky specific)
  - Improved mobile wallet compatibility
- **Wallet Integration**
  - Enhanced `UnifiedWalletConnect` with three-column layout
  - Added dynamic wallet address detection for payment recipients
  - Improved connection state management across all networks

### Fixed

- **Morph Holesky Payment Issues**
  - Fixed "0 ETH" display issue → now shows "1 USDT" correctly
  - Corrected recipient address from placeholder to connected wallet
  - Fixed decimal calculation (1 USDT = 1×10^18 token units)
  - Resolved "Wrong address format" error in mobile wallets

### Technical Details

- **New Files**:
  - `src/config/morph-holesky-chain.js` - Network configuration
  - `src/components/MorphWalletConnect.jsx` - MetaMask integration
  - `src/services/morphPaymentService.js` - Payment processing
  - `docs/BLOCKCHAIN_QR_INTEGRATION_GUIDE.md` - Integration knowledge base
- **Modified Files**:
  - `src/components/UnifiedWalletConnect.jsx` - Multi-chain support
  - `src/components/EnhancedPaymentQRModal.jsx` - Three-network modal
- **Dependencies**: No new external dependencies added

## [1.2.0] - 2025-07-30

### Added

- **Solana Testnet Integration**
  - Phantom wallet support
  - SOL token payments via Solana Pay standard
  - Solana-specific QR code generation
- **Multi-Chain Architecture**
  - Unified wallet connection interface
  - Network selection in payment modal
  - Chain-specific payment services

### Changed

- Enhanced payment modal with network selection tabs
- Improved AR QR code positioning system

## [1.1.0] - 2025-07-30

### Added

- **BlockDAG Primordial Testnet Integration**
  - USBDG+ token payment support
  - ThirdWeb wallet integration
  - EIP-681 compliant QR codes for blockchain payments

### Changed

- Enhanced payment system with blockchain integration
- Updated agent interaction modal with payment options

## [1.0.0] - 2025-07-30

### Added

- **Initial AR Viewer Implementation**
  - React/Vite development environment
  - Three.js AR scene rendering
  - Agent interaction system
  - Basic payment QR code generation
- **Core Components**
  - AR camera view with agent positioning
  - Interactive 3D agent models
  - Payment modal system
  - QR code display and scanning
- **Database Integration**
  - Supabase backend setup
  - Agent data management
  - Real-time updates

### Technical Foundation

- React 18 with Vite build system
- Three.js for 3D rendering
- Supabase for backend services
- Responsive design for mobile devices

---

## Version History Summary

| Version | Date       | Key Feature          | Impact                    |
| ------- | ---------- | -------------------- | ------------------------- |
| 1.3.0   | 2025-07-30 | Morph Holesky + USDT | 3-blockchain support      |
| 1.2.0   | 2025-07-30 | Solana Integration   | Multi-chain architecture  |
| 1.1.0   | 2025-07-30 | BlockDAG Integration | First blockchain payments |
| 1.0.0   | 2025-07-30 | AR Viewer Foundation | Core AR functionality     |

---

## Upcoming Releases

### [1.4.0] - Planned

- **Production Deployment**
  - Environment configuration
  - SSL setup
  - Domain configuration
- **Enhanced Testing**
  - Unit tests for payment flows
  - Integration tests for blockchain connections
  - E2E tests for AR interactions

### [1.5.0] - Planned

- **Additional Blockchain Networks**
  - Polygon support
  - Arbitrum integration
  - Base network
- **Advanced AR Features**
  - Particle effects
  - Hand gesture controls
  - Voice commands

### [2.0.0] - Future

- **Enterprise Features**
  - Multi-tenant support
  - Advanced analytics
  - White-label solutions
- **Mobile Apps**
  - Native iOS app
  - Native Android app
  - WebXR optimization

---

**Changelog Conventions:**

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes
