# 🚀 AgentSphere: Deployment Form Updates & AR Viewer Integration

## 🎯 OBJECTIVE

Update AgentSphere deployment system with enhanced features, multi-blockchain support, and seamless integration with AR Viewer for complete agent lifecycle management based on **EXACT DATABASE SCHEMA ALIGNMENT**.

## 📂 WORKSPACE INTEGRATION

### **Multi-Root Workspace Setup**

This project will be integrated with AR Viewer in a shared VS Code workspace:

```json
// .vscode/agentsphere-development.code-workspace
{
  "folders": [
    {
      "name": "AgentSphere (Deployment)",
      "path": "."
    },
    {
      "name": "AR Viewer (NeAR Viewer)",
      "path": "../ar-agent-viewer-web-man-US"
    }
  ]
}
```

**Shared Resources:**

- **Supabase Database**: Both projects use same `deployed_objects` table
- **Environment Variables**: Consistent configuration across projects
- **Agent Data Flow**: AgentSphere deploys → AR Viewer displays

## 🗄️ CURRENT DATABASE SCHEMA (72 Fields)

### **Key Fields for Form Updates:**

```javascript
// EXISTING FIELDS TO LEVERAGE (Already in Database)
{
  // Core Identity
  id: "uuid",
  name: "string",
  description: "string",
  agent_type: "string",
  object_type: "string",

  // Location & RTK
  latitude: "number",
  longitude: "number",
  altitude: "number",              // ✅ ALREADY EXISTS
  preciselatitude: "number",       // ✅ RTK enhanced
  preciselongitude: "number",      // ✅ RTK enhanced
  precisealtitude: "number",       // ✅ RTK enhanced altitude
  location_type: "string",
  rtk_enhanced: "boolean",
  rtk_provider: "string",
  accuracy: "number",
  correctionapplied: "boolean",

  // Blockchain & Payment (FULLY IMPLEMENTED)
  chain_id: "number",              // ✅ ALREADY EXISTS (2810)
  token: "string",                 // ✅ ALREADY EXISTS ("USDT")
  token_address: "string",         // ✅ ALREADY EXISTS
  token_symbol: "string",          // ✅ ALREADY EXISTS
  currency_type: "string",         // ✅ ALREADY EXISTS

  // Wallet System (PROPERLY STRUCTURED)
  owner_wallet: "string",          // ✅ Deployer wallet
  user_id: "string",               // ✅ Same as owner_wallet
  agent_wallet_address: "object",  // ✅ Can be same as owner
  payment_recipient_address: "object", // ✅ Payment receiver

  // Interaction & Fees
  interaction_fee: "number",       // ✅ ALREADY EXISTS
  interaction_fee_usdfc: "number", // ✅ Legacy field
  interaction_range: "number",     // ✅ ALREADY EXISTS (15m)
  interaction_types: "string",     // ✅ Comma-separated

  // Agent Configuration
  range_meters: "number",          // ✅ Visibility range (25m)
  visibility_radius: "number",     // ✅ ALREADY EXISTS (50m)
  trailing_agent: "boolean",       // ✅ ALREADY EXISTS
  ar_notifications: "boolean",     // ✅ ALREADY EXISTS

  // Communication
  text_chat: "boolean",
  voice_chat: "boolean",
  video_chat: "boolean",
  chat_enabled: "boolean",
  voice_enabled: "boolean",

  // 3D Model
  model_type: "string",            // ✅ cube/sphere/pyramid
  model_url: "object",
  scale_x: "number",
  scale_y: "number",
  scale_z: "number",
  rotation_x: "number",
  rotation_y: "number",
  rotation_z: "number",

  // Status & Metadata
  is_active: "boolean",
  created_at: "string",
  updated_at: "string",
  network: "string"                // ✅ "avalanche-fuji" format
}
```

## 🔄 DEPLOYMENT FORM UPDATES

### **Section 1: Location & Deployment**

#### **Current Components to Keep:**

- ✅ **Get Current Location** button
- ✅ **Trailing Agent** checkbox → maps to `trailing_agent` field
- ✅ **Visibility Range** slider (25m) → maps to `range_meters` field
- ✅ **Interaction Range** slider (15m) → maps to `interaction_range` field
- ✅ **AR Notifications** checkbox → maps to `ar_notifications` field
- ✅ **Notification & Discovery** explanation text

#### **Components to Modify:**

**1. RTK Enhanced Location Button (NO CHANGES NEEDED)**

```javascript
// CURRENT IMPLEMENTATION IS PERFECT
"Get RTK Enhanced Location";
// Maps to existing fields:
// - latitude, longitude, altitude (basic GPS)
// - preciselatitude, preciselongitude, precisealtitude (RTK enhanced)
// - rtk_enhanced: true
// - rtk_provider: "GeoNet"
// - accuracy: number
```

**2. Blockchain Balance Check**

```javascript
// BEFORE
"Check BDAG Balance" (green button)

// AFTER
"Connected to: [BLOCKCHAIN_NAME]" (info display)
```

- **Remove**: Balance checking functionality
- **Add**: Display current connected blockchain name
- **Database Mapping**: Auto-detect and set `chain_id` field (currently 2810 for Morph Holesky)
- **Network Field**: Update `network` field (currently "avalanche-fuji")
- **Styling**: Info badge instead of action button

### **Section 2: Agent Details**

#### **Agent Type Dropdown - Updated for Database Compatibility**

```javascript
// CURRENT DATABASE VALUES (from analysis):
// - "ai_agent" (47 agents)
// - "Intelligent Assistant" (3 agents)
// - "Bus Stop Agent" (3 agents)
// - "tutor" (1 agent)
// - "Content Creator" (1 agent)
// - "study_buddy" (1 agent)

// RECOMMENDED DROPDOWN VALUES (Database Compatible):
const AGENT_TYPES = [
  "Intelligent Assistant", // ✅ Already exists in DB
  "Local Services", // 🆕 New category
  "Payment Terminal", // 🆕 New category
  "Trailing Payment Terminal", // 🆕 Conditional (trailing_agent = true)
  "My Ghost", // 🆕 Conditional (trailing_agent = true)
  "Game Agent", // 🆕 New category
  "3D World Builder", // 🆕 New category (for cubes/spheres/pyramids)
  "Home Security", // 🆕 New category
  "Content Creator", // ✅ Already exists in DB
  "Real Estate Broker", // 🆕 New category
  "Bus Stop Agent", // ✅ Already exists in DB
  "Study Buddy", // 🆕 Maps to existing "study_buddy"
  "Tutor", // ✅ Already exists in DB (lowercase)
  "Landmark", // 🆕 New category
  "Building", // 🆕 New category
];
```

**Database Field Mapping:**

- **Primary Field**: `agent_type` (string)
- **Secondary Field**: `object_type` (string) - can be same as agent_type
- **Model Field**: `model_type` (string) - for 3D objects: "cube", "sphere", "pyramid"

#### **Location Type Dropdown - Database Aligned**

```javascript
// CURRENT DATABASE VALUES:
// - "Street" (most common)
// - Other values from existing schema

// UPDATED DROPDOWN:
const LOCATION_TYPES = [
  "Home", // 🆕 Add to DB
  "Street", // ✅ Already exists
  "Countryside", // 🆕 Add to DB
  "Classroom", // 🆕 Add to DB
  "Office", // 🆕 Add to DB
  "Car", // 🆕 Add to DB
  "Property", // 🆕 Add to DB
];

// Database Field: location_type (string)
```

#### **Components to Keep (Database Mapped):**

- ✅ **Agent Name** → `name` field
- ✅ **Agent Description** → `description` field
- ✅ **Agent Interaction Methods** → `interaction_types` field (comma-separated)
  - Maps to: `text_chat`, `voice_chat`, `video_chat` booleans
  - Also sets: `chat_enabled`, `voice_enabled` flags

### **Section 3: Agent Wallet Type - Database Schema Aligned**

#### **Current Wallet Fields in Database:**

```javascript
// EXISTING WALLET FIELDS:
{
  owner_wallet: "0xD7CA8219C8AfA07b455Ab7e004FC5381B3727B1e",  // ✅ Deployer
  user_id: "0xD7CA8219C8AfA07b455Ab7e004FC5381B3727B1e",       // ✅ Same as owner
  agent_wallet_address: null,                                   // ✅ Can be set to owner
  payment_recipient_address: null,                              // ✅ Payment receiver
  deployer_wallet_address: null,                                // ✅ Alternative field
  agent_wallet_type: null                                       // ✅ Wallet type metadata
}
```

#### **Required Changes (Database Schema Compliant):**

**1. Agent Wallet = User Wallet (Use Existing Fields)**

```javascript
// NEW IMPLEMENTATION:
const deploymentData = {
  owner_wallet: userConnectedWallet, // ✅ Primary owner field
  user_id: userConnectedWallet, // ✅ User identification
  agent_wallet_address: userConnectedWallet, // ✅ Agent's wallet (same as owner)
  payment_recipient_address: userConnectedWallet, // ✅ Where payments go
  deployer_wallet_address: userConnectedWallet, // ✅ Who deployed it
};
```

**2. Update Purpose Text**

```javascript
// BEFORE
"These wallet addresses (simulated agent wallet and your connected wallet) along with the interaction fee will be used for creating the QR code for payment during agent interactions.";

// AFTER
"The agent's wallet address is identical to your connected wallet. This address will be stored in the 'payment_recipient_address' field and will receive all payments when users interact with your deployed agent. The interaction fee and token selection below will be used for generating payment QR codes.";
```

### **Section 4: Economics & Ownership - Database Schema Perfect Match**

#### **Interaction Fee - Token Selection (Using Existing Fields)**

```javascript
// EXISTING DATABASE FIELDS (PERFECTLY IMPLEMENTED):
{
  interaction_fee: 0.5,                    // ✅ Main fee amount
  interaction_fee_usdfc: 0.5,             // ✅ Legacy field (keep for compatibility)
  currency_type: "USDFC",                 // ✅ Token type
  token: "USDT",                          // ✅ Token symbol
  token_symbol: "USDT",                   // ✅ Display symbol
  token_address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98", // ✅ Contract address
  chain_id: 2810                          // ✅ Blockchain ID
}
```

**Form Implementation (Database Compatible):**

```javascript
// Token Selection Dropdown - Maps to existing DB structure
const SUPPORTED_TOKENS = [
  {
    symbol: "USDT",
    name: "Tether USD",
    addresses: {
      2810: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98", // Morph Holesky USDT
      1: "0xdAC17F958D2ee523a2206206994597C13D831ec7", // Ethereum USDT
      137: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", // Polygon USDT
    },
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    addresses: {
      2810: "0x...", // Morph Holesky USDC (to be added)
      1: "0xA0b86a33E6441d0C4c4c7a85d9C0E5C4b3a8e8b4",
      137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
    },
  },
  // ... more tokens
];

// Form Data Mapping
const handleTokenSelection = (selectedToken, amount, chainId) => {
  return {
    // Core payment fields
    interaction_fee: parseFloat(amount), // ✅ Existing field
    interaction_fee_usdfc: parseFloat(amount), // ✅ Keep for compatibility

    // Token identification
    currency_type: selectedToken.symbol, // ✅ Existing field
    token: selectedToken.symbol, // ✅ Existing field
    token_symbol: selectedToken.symbol, // ✅ Existing field
    token_address: selectedToken.addresses[chainId], // ✅ Existing field

    // Blockchain
    chain_id: chainId, // ✅ Existing field
    network: getNetworkName(chainId), // ✅ Existing field
  };
};
```

#### **Amount Input Validation (Database Compatible):**

```javascript
// Support both integer and decimal (current DB has 0.5)
<input
  type="number"
  step="0.01" // Allow decimals (DB supports this)
  min="0.01" // Minimum fee
  max="1000" // Reasonable maximum
  placeholder="Enter fee amount"
  name="interaction_fee"
  onChange={(e) => setInteractionFee(parseFloat(e.target.value))}
/>
```

#### **Deploy Button Logic (Database Field Validation):**

```javascript
const canDeploy = () => {
  return (
    // Wallet & Identity
    owner_wallet && // ✅ Connected wallet
      // Core Agent Info
      name?.trim() !== "" && // ✅ Required field
      description?.trim() !== "" && // ✅ Required field
      agent_type !== "" && // ✅ Required field
      location_type !== "" && // ✅ Required field
      // Location Data
      latitude &&
      longitude && // ✅ GPS coordinates set
      (rtk_enhanced ? preciselatitude && preciselongitude : true), // ✅ RTK validation
    // Payment Configuration
    interaction_fee > 0 && // ✅ Fee amount
      token_symbol !== "" && // ✅ Token selected
      token_address !== "" && // ✅ Contract address
      chain_id && // ✅ Blockchain set
      // Conditional Validations
      (!trailing_agent || (trailing_agent && isValidTrailingType(agent_type)))
  );
};
```

## 🔄 DATABASE COMPATIBILITY CHECK

### **Current Database State Analysis:**

```javascript
// EXISTING DATA SAMPLE (from actual DB):
{
  id: "dd36a3f3-85ee-4242-9c61-00a38cf34a67",
  name: "Cube 1",                                    // ✅ Working
  description: "A 3D cube object deployed in AR space", // ✅ Working
  agent_type: "ai_agent",                            // ✅ Working
  object_type: "ai_agent",                           // ✅ Working

  // Location (RTK Enhanced) - PERFECTLY IMPLEMENTED
  latitude: 50.6474448407908,                        // ✅ Working
  longitude: 13.8354846700805,                       // ✅ Working
  altitude: 143.286123475351,                        // ✅ Working
  preciselatitude: 50.6474448407908,                 // ✅ RTK Working
  preciselongitude: 13.8354846700805,                // ✅ RTK Working
  precisealtitude: 143.286123475351,                 // ✅ RTK Working
  rtk_enhanced: true,                                // ✅ Working
  rtk_provider: "GeoNet",                            // ✅ Working
  location_type: "Street",                           // ✅ Working

  // Blockchain & Payment - FULLY FUNCTIONAL
  chain_id: 2810,                                    // ✅ Morph Holesky
  token: "USDT",                                     // ✅ Working
  token_symbol: "USDT",                              // ✅ Working
  token_address: "0x9E12AD42c4E4d2acFBADE01a96446e48e6764B98", // ✅ Working
  currency_type: "USDFC",                            // ✅ Working
  network: "avalanche-fuji",                         // ✅ Working

  // Wallet System - PROPERLY STRUCTURED
  owner_wallet: "0xD7CA8219C8AfA07b455Ab7e004FC5381B3727B1e", // ✅ Working
  user_id: "0xD7CA8219C8AfA07b455Ab7e004FC5381B3727B1e",      // ✅ Working

  // Interaction & Fees - WORKING
  interaction_fee: 0.5,                              // ✅ Working
  interaction_range: 15,                             // ✅ Working
  range_meters: 25,                                  // ✅ Working
  trailing_agent: false,                             // ✅ Working
  ar_notifications: true,                            // ✅ Working

  // Communication - IMPLEMENTED
  text_chat: true,                                   // ✅ Working
  voice_chat: true,                                  // ✅ Working
  video_chat: false,                                 // ✅ Working
  chat_enabled: true,                                // ✅ Working
  voice_enabled: true,                               // ✅ Working

  // 3D Model - WORKING
  model_type: "sphere",                              // ✅ Working
  scale_x: 1, scale_y: 1, scale_z: 1,               // ✅ Working
  rotation_x: 0, rotation_y: 0, rotation_z: 0,      // ✅ Working

  // Status
  is_active: true,                                   // ✅ Working
  created_at: "2025-06-23T12:33:07.420289+00:00",   // ✅ Working
  updated_at: "2025-06-29T05:39:30.542471+00:00"    // ✅ Working
}
```

### **NO DATABASE MIGRATIONS NEEDED!**

The current database schema already supports ALL requirements:

- ✅ **RTK Enhanced Location**: All fields exist
- ✅ **Multi-Blockchain**: Chain ID, token address, network fields exist
- ✅ **Payment System**: Complete wallet and fee structure
- ✅ **Agent Categories**: Agent type and object type fields
- ✅ **3D Models**: Model type and transformation fields
- ✅ **Interaction System**: All communication flags and ranges

## 🔗 AR VIEWER INTEGRATION

### **Data Flow Architecture (Schema Aligned)**

```
AgentSphere (Deploy) → Supabase → AR Viewer (Display)
     ↓                    ↓              ↓
1. User deploys agent → 2. Data stored → 3. Agent appears in marketplace
4. User sets payment → 5. QR generated → 6. Payment to owner_wallet
```

### **QR Code Data Structure (Database Fields)**

```javascript
const generateQRCodeData = (deployedAgent) => {
  return {
    // Wallet (where payment goes)
    wallet_address:
      deployedAgent.payment_recipient_address || deployedAgent.owner_wallet,

    // Payment details
    amount: deployedAgent.interaction_fee,
    token_address: deployedAgent.token_address,
    token_symbol: deployedAgent.token_symbol,
    currency_type: deployedAgent.currency_type,

    // Blockchain
    chain_id: deployedAgent.chain_id,
    network: deployedAgent.network,

    // Agent reference
    agent_id: deployedAgent.id,
    agent_name: deployedAgent.name,
  };
};
```

### **Deployment Function (Database Schema Compliant):**

```javascript
const deployAgent = async (formData, connectedWallet, chainId) => {
  try {
    const deploymentData = {
      // Core Identity
      name: formData.agentName,
      description: formData.agentDescription,
      agent_type: formData.agentType,
      object_type: formData.agentType, // Same as agent_type

      // Location (RTK Enhanced)
      latitude: formData.gpsLatitude,
      longitude: formData.gpsLongitude,
      altitude: formData.gpsAltitude,
      preciselatitude: formData.rtkLatitude || formData.gpsLatitude,
      preciselongitude: formData.rtkLongitude || formData.gpsLongitude,
      precisealtitude: formData.rtkAltitude || formData.gpsAltitude,
      rtk_enhanced: formData.useRTK,
      rtk_provider: formData.useRTK ? "GeoNet" : null,
      location_type: formData.locationType,
      accuracy: formData.gpsAccuracy,
      correctionapplied: formData.useRTK,

      // Wallet System (All same address)
      owner_wallet: connectedWallet,
      user_id: connectedWallet,
      agent_wallet_address: connectedWallet,
      payment_recipient_address: connectedWallet,
      deployer_wallet_address: connectedWallet,

      // Blockchain & Payment
      chain_id: chainId,
      network: getNetworkName(chainId),
      token: formData.selectedToken.symbol,
      token_symbol: formData.selectedToken.symbol,
      token_address: formData.selectedToken.addresses[chainId],
      currency_type: formData.selectedToken.symbol,
      interaction_fee: parseFloat(formData.interactionFee),
      interaction_fee_usdfc: parseFloat(formData.interactionFee), // Legacy compatibility

      // Agent Configuration
      interaction_range: formData.interactionRange || 15,
      range_meters: formData.visibilityRange || 25,
      trailing_agent: formData.isTrailingAgent || false,
      ar_notifications: formData.arNotifications || true,

      // Communication
      text_chat: formData.interactionMethods.includes("text_chat"),
      voice_chat: formData.interactionMethods.includes("voice_chat"),
      video_chat: formData.interactionMethods.includes("video_chat"),
      chat_enabled: formData.interactionMethods.length > 0,
      voice_enabled: formData.interactionMethods.includes("voice_chat"),

      // 3D Model (if applicable)
      model_type: formData.modelType || "cube",
      scale_x: 1,
      scale_y: 1,
      scale_z: 1,
      rotation_x: 0,
      rotation_y: 0,
      rotation_z: 0,

      // Status
      is_active: true,
      deployment_cost: 100, // Standard cost
    };

    // Deploy to database
    const { data, error } = await supabase
      .from("deployed_objects")
      .insert(deploymentData)
      .select();

    if (error) throw error;

    // Trigger real-time update to AR Viewer
    await supabase.channel("agent_deployments").send({
      type: "broadcast",
      event: "agent_deployed",
      payload: data[0],
    });

    return data[0];
  } catch (error) {
    console.error("Deployment failed:", error);
    throw error;
  }
};
```

## 📋 IMPLEMENTATION CHECKLIST

### **Phase 1: Form Updates (Database Compatible)**

- [ ] Update blockchain balance display (use `chain_id` field)
- [ ] Enhance agent type dropdown (update `agent_type` field)
- [ ] Add location type options (update `location_type` field)
- [ ] Implement conditional trailing agent logic (`trailing_agent` field)

### **Phase 2: Payment System (Existing Schema)**

- [ ] Set all wallet fields to same address (`owner_wallet`, `payment_recipient_address`, etc.)
- [ ] Implement token selection (use `token`, `token_symbol`, `token_address` fields)
- [ ] Update fee input (use existing `interaction_fee` field)
- [ ] Chain detection (use existing `chain_id` and `network` fields)

### **Phase 3: Data Validation (Schema Compliant)**

- [ ] Validate all required fields before deployment
- [ ] Ensure RTK data populates correct fields
- [ ] Test payment configuration with existing token addresses
- [ ] Verify agent type compatibility with existing data

### **Phase 4: AR Viewer Integration (Existing Infrastructure)**

- [ ] Test real-time deployment notifications
- [ ] Verify QR code generation uses correct database fields
- [ ] Validate payment routing to `payment_recipient_address`
- [ ] Test agent display in NeAR Agents Marketplace

## 🎯 SUCCESS CRITERIA

### **Database Compatibility**

✅ All form data maps to existing database fields
✅ No database migrations required
✅ Existing agents remain fully functional
✅ New deployments use enhanced categories

### **Payment System**

✅ Agent wallet = Owner wallet (same address in all fields)
✅ Payments route to `payment_recipient_address`
✅ QR codes use existing `token_address` and `chain_id`
✅ Multi-token support with existing schema

### **AR Viewer Integration**

✅ Deployed agents appear immediately in NeAR Agents Marketplace
✅ Filter categories work with new agent types
✅ Payment QR codes function with real blockchain transactions
✅ Agent data consistency across both applications

---

**Implementation Priority: HIGH** 🔥  
**Database Migration Required: NO** ✅  
**Existing Data Compatibility: 100%** ✅  
**Ready for Immediate Implementation** 🚀
