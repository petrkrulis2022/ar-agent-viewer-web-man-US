# Agent Type Migration - Clean Naming Convention

## Overview

Completed a comprehensive migration from confusing/legacy agent types to clean, unambiguous naming convention. This eliminates all type confusion and provides a fresh foundation for payment terminal agents.

## Database Schema Changes

### SQL Migration (Executed)

```sql
-- Removed all legacy agents (clean slate)
DELETE FROM deployed_objects;

-- Updated agent_type constraint with NEW CLEAN TYPES:
- 'my_payment_terminal'      (replaces: content_creator, My Payment Terminal)
- 'pos_terminal'             (replaces: payment_terminal, Payment Terminal - POS)
- 'artm_terminal'            (replaces: virtual_terminal, Virtual Terminal, Virtual Terminal (ARTM))
- 'trailing_payment_terminal' (unchanged)

-- Updated object_type constraint with same NEW CLEAN TYPES
```

## Codebase Updates

### 1. Agent Type Mapping Utility

**File:** `src/utils/agentTypeMapping.js`

Updated all type mappings, filters, icons, and keywords:

- `AGENT_TYPE_LABELS`: Maps database values to display labels
- `LABEL_TO_VALUE`: Reverse mapping for lookup
- `normalizeAgentType()`: Converts any format to clean underscore format
- `isPaymentAgent()`: Updated to include new payment types
- `isVirtualTerminal()`: Now checks for `artm_terminal` only
- Icon maps: Updated all references
- Keyword maps: Updated for new type names

### 2. 3D Agent Rendering

**File:** `src/components/Enhanced3DAgent.jsx`

Updated model selection logic:

```javascript
// My Payment Terminal - uses my_personal_terminal.glb
const isMyPaymentTerminal = agent.agent_type === "my_payment_terminal";

// Payment Terminal POS - uses p-o-s_terminal.glb
const isPaymentTerminalPOS = agent.agent_type === "pos_terminal";

// Virtual Terminal ARTM - uses atm_6_mb.glb
const isVirtualTerminal = agent.agent_type === "artm_terminal";
```

Updated color codes for glow effects:

- `payment_terminal` → `pos_terminal`
- `content_creator` → `my_payment_terminal`
- Added `artm_terminal` colors

### 3. Component Type Filters

**Files:**

- `src/components/NeARAgentsMarketplace.jsx`
- `src/components/NewNeARAgentsMarketplace.jsx`

Updated marketplace category filters:

```javascript
// OLD:
{ id: "payment_terminal", label: "💳 Payment Terminal" }
{ id: "content_creator", label: "🎨 Content Creator" }
{ id: "home_security", label: "🔒 Home Security" }

// NEW:
{ id: "pos_terminal", label: "💳 Payment Terminal" }
{ id: "my_payment_terminal", label: "💰 My Payment Terminal" }
{ id: "artm_terminal", label: "🏧 ARTM Terminal" }
```

### 4. Agent Overlay Icons & Colors

**File:** `src/components/ARAgentOverlay.jsx`

Updated getAgentIcon() and getAgentColor():

- `payment_terminal` → `pos_terminal`
- `content_creator` → `my_payment_terminal`
- Added `artm_terminal` with blue-cyan gradient

### 5. Camera View Modal Routing

**File:** `src/components/CameraView.jsx`

Updated ARTM detection:

```javascript
// OLD: selectedAgent?.agent_type === "Virtual Terminal"
// NEW: selectedAgent?.agent_type === "artm_terminal"
```

### 6. 3D Model Fallback Cases

**File:** `src/components/Agent3DModel.jsx`

Updated case statements:

- `content_creator` → `my_payment_terminal`
- `payment_terminal` → `pos_terminal`
- Deprecated `home_security` (commented out)

## Summary of Type Changes

| Old Type           | New Type                      | Display Label          | Model                    |
| ------------------ | ----------------------------- | ---------------------- | ------------------------ |
| `content_creator`  | `my_payment_terminal`         | My Payment Terminal    | my_personal_terminal.glb |
| `payment_terminal` | `pos_terminal`                | Payment Terminal - POS | p-o-s_terminal.glb       |
| `Virtual Terminal` | `artm_terminal`               | ARTM Terminal          | atm_6_mb.glb             |
| `home_security`    | ❌ REMOVED                    | -                      | -                        |
| `virtual_terminal` | ❌ REPLACED → `artm_terminal` | ARTM Terminal          | atm_6_mb.glb             |

## Files Modified

1. ✅ `src/utils/agentTypeMapping.js` - Type mapping utility
2. ✅ `src/components/Enhanced3DAgent.jsx` - 3D rendering logic
3. ✅ `src/components/NeARAgentsMarketplace.jsx` - Marketplace filters
4. ✅ `src/components/NewNeARAgentsMarketplace.jsx` - Alternative marketplace
5. ✅ `src/components/ARAgentOverlay.jsx` - Icon/color styling
6. ✅ `src/components/CameraView.jsx` - Modal routing
7. ✅ `src/components/Agent3DModel.jsx` - Fallback 3D models

## Build Status

✅ **Production Build**: Successful

- No syntax errors
- All imports resolved
- Ready for deployment
- Dev server running at http://localhost:5176/

## Next Steps

1. **Deploy new agents** using clean type names:

   - `my_payment_terminal`: User's personal payment terminals
   - `pos_terminal`: Point of sale payment terminals
   - `artm_terminal`: ARTM/ATM cash withdrawal terminals

2. **Test each type** in AR Viewer:

   - Verify 3D models render correctly
   - Check positioning (screen vs GPS mode)
   - Validate interaction modals

3. **Update deployment forms** in AgentSphere (if applicable):
   - Dropdown values to use new clean types
   - Validation logic updated
   - All 6 references as per AgentSphere update list

## Notes

- All legacy types are now consolidated to 3 clear payment types
- `home_security` and `content_creator` are completely removed
- `payment_terminal` type name was confusing with old POS, now `pos_terminal` is explicit
- `virtual_terminal` replaced with `artm_terminal` (more descriptive)
- Backward compatibility: `normalizeAgentType()` can still handle old formats

## Verification Commands

```bash
# Build verification
npm run build

# Dev server
npm run dev
# Visit: http://localhost:5176/

# Search for any remaining old types
grep -r "content_creator\|Virtual Terminal\|home_security" src/
# Should return only in comments or deprecated sections
```
