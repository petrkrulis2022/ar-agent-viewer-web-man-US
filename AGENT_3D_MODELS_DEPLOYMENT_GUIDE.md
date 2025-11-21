# Agent 3D Models Deployment Guide

## Overview

This guide documents the configuration and deployment process for custom 3D agent models in the AR AgentSphere viewer, based on the successful deployment of the bus agent.

---

## Current Agent Types & 3D Models

### ✅ Deployed Custom Models

| Agent Type  | Model File                     | Status     | Scale                    | Notes                 |
| ----------- | ------------------------------ | ---------- | ------------------------ | --------------------- |
| `bus_agent` | `/models/agents/bus_agent.glb` | ✅ Working | Auto-scaled to 1.5 units | Successfully deployed |

### 📋 Pending Custom Models

| Agent Type         | Model File              | Expected Location        | Priority |
| ------------------ | ----------------------- | ------------------------ | -------- |
| `train_agent`      | `train_agent.glb`       | `/public/models/agents/` | High     |
| `hotel_agent`      | `hotel_agent.glb`       | `/public/models/agents/` | Medium   |
| `flight_agent`     | `flight_agent.glb`      | `/public/models/agents/` | High     |
| `restaurant_agent` | `restarurant_agent.glb` | `/public/models/agents/` | Medium   |
| `travel_agent`     | `travel_agent.glb`      | `/public/models/agents/` | Medium   |

---

## Technical Configuration

### 1. Database Schema Requirements

#### Agent Type Preservation

**Critical Fix Applied:**

```javascript
// useDatabase.js line 273
agent_type: obj.agent_type ||
  (obj.object_type !== "agent" ? obj.object_type : null) ||
  "intelligent_assistant";
```

**Key Points:**

- Database can store `agent_type` as primary field
- If `agent_type` is null, fallback to `object_type` (if not generic "agent")
- Final fallback is `"intelligent_assistant"`
- **Must use underscore format**: `bus_agent`, `train_agent` (not spaces)

#### Required Database Fields

```sql
-- deployed_objects table
agent_type VARCHAR        -- e.g., 'bus_agent', 'train_agent'
object_type VARCHAR       -- e.g., 'bus_agent', 'agent'
name VARCHAR             -- e.g., 'Hedera Bus AI 1'
latitude DECIMAL
longitude DECIMAL
altitude DECIMAL
scale_x DECIMAL          -- Default: 1.0
scale_y DECIMAL          -- Default: 1.0
scale_z DECIMAL          -- Default: 1.0
rotation_x DECIMAL       -- Default: 0.0
rotation_y DECIMAL       -- Default: 0.0 (rotation handled by component)
rotation_z DECIMAL       -- Default: 0.0
visibility_radius INT    -- Meters, default: 100
```

---

### 2. 3D Model File Requirements

#### GLB Format Specifications

- **Format**: glTF 2.0 Binary (.glb)
- **Magic Header**: Must start with "glTF" bytes
- **File Size**: Tested working with 60MB (bus_agent.glb)
- **Location**: `/public/models/agents/`

#### Model Quality Checklist

```bash
# Verify GLB file integrity
xxd -l 16 /path/to/model.glb
# Should output: 676c 5446 0200 0000 (glTF v2)

# Check file size
ls -lh /public/models/agents/
```

#### Model Preparation

- **Recommended Size**: Any size (auto-scaling applied)
- **Center Origin**: Models should be centered at (0,0,0)
- **Materials**: Standard PBR materials work best
- **Textures**: Embedded in GLB preferred
- **Animations**: Supported but not required

---

### 3. Auto-Scaling Configuration

#### Current Implementation (`Enhanced3DAgent.jsx` lines 59-73)

```javascript
// Calculate bounding box
const box = new THREE.Box3().setFromObject(clonedScene);
const size = new THREE.Vector3();
box.getSize(size);

// Auto-scale to target size
const maxDimension = Math.max(size.x, size.y, size.z);
const targetSize = 1.5; // Units - adjust per model type
const autoScale = maxDimension > 0 ? targetSize / maxDimension : 1.0;

// Auto-center at ground level
const center = new THREE.Vector3();
box.getCenter(center);
```

#### Scale Parameters

| Parameter         | Current Value           | Purpose           | Adjustment Guide           |
| ----------------- | ----------------------- | ----------------- | -------------------------- |
| `targetSize`      | 1.5 units               | Maximum dimension | Increase for larger models |
| `autoScale`       | Calculated              | Applied uniformly | Read-only, auto-calculated |
| Position Y Offset | `-center.y * autoScale` | Ground alignment  | Keeps model on ground      |

**Per-Agent Type Scaling (Future Enhancement):**

```javascript
// Recommended approach for different agent types
const agentScaleConfig = {
  bus_agent: 1.5, // Current working size
  train_agent: 2.0, // Trains might need to be larger
  hotel_agent: 1.8, // Buildings
  flight_agent: 1.5, // Airplanes
  restaurant_agent: 1.2, // Smaller buildings
  travel_agent: 1.0, // Human-scale
};
const targetSize = agentScaleConfig[agentType] || 1.5;
```

---

### 4. Animation Settings

#### Rotation Speed

```javascript
// Enhanced3DAgent.jsx line 149
const spinSpeed = useRef(0.05 + Math.random() * 0.05); // Reduced from 0.3
```

**Animation Parameters:**
| Setting | Current Value | Range | Purpose |
|---------|--------------|-------|---------|
| Base Spin Speed | 0.05 rad/s | 0.05-0.10 | Slow rotation around Y-axis |
| Float Intensity | `0.15 * scale` | - | Gentle up/down bobbing |
| Pulse (on hover) | 1.08x scale | - | Size increase when selected |

**Disable Rotation (if needed):**

```javascript
// Set spinSpeed to 0 for static models
const spinSpeed = useRef(0);
```

---

### 5. Lighting Configuration

#### Current Setup (`Enhanced3DAgent.jsx` lines 95-99)

```javascript
<ambientLight intensity={1.5} />
<directionalLight position={[5, 5, 5]} intensity={2} />
<directionalLight position={[-5, 5, -5]} intensity={2} />
<pointLight position={[0, 3, 0]} intensity={3} color="#ffffff" />
```

**Lighting Guidelines:**

- **Ambient**: 1.5 intensity for base illumination
- **Directional**: 2x lights from opposing angles (better shadows)
- **Point Light**: Above model for top-down emphasis
- **Colors**: White (#ffffff) for neutral rendering

---

### 6. Model Registration Process

#### Step 1: Add to Model Mapping (`Enhanced3DAgent.jsx` line 250)

```javascript
const agentModelPaths = {
  bus_agent: "/models/agents/bus_agent.glb",
  train_agent: "/models/agents/train_agent.glb", // Add new types here
  hotel_agent: "/models/agents/hotel_agent.glb",
  flight_agent: "/models/agents/flight_agent.glb",
  restaurant_agent: "/models/agents/restarurant_agent.glb",
  travel_agent: "/models/agents/travel_agent.glb",
};
```

#### Step 2: Preload Models (`Enhanced3DAgent.jsx` lines 11-16)

```javascript
useGLTF.preload("/models/agents/bus_agent.glb");
useGLTF.preload("/models/agents/train_agent.glb"); // Add preloads
useGLTF.preload("/models/agents/hotel_agent.glb");
useGLTF.preload("/models/agents/flight_agent.glb");
useGLTF.preload("/models/agents/restarurant_agent.glb");
useGLTF.preload("/models/agents/travel_agent.glb");
```

#### Step 3: Upload GLB File

```bash
# Copy model to public directory
cp /path/to/new_agent.glb /public/models/agents/

# Verify file
file /public/models/agents/new_agent.glb
# Should output: data

# Check GLB header
xxd -l 16 /public/models/agents/new_agent.glb
```

#### Step 4: Database Entry

```sql
INSERT INTO deployed_objects (
  name,
  agent_type,
  object_type,
  latitude,
  longitude,
  altitude,
  visibility_radius,
  is_active
) VALUES (
  'Train Station Agent 1',
  'train_agent',           -- Must match agentModelPaths key
  'train_agent',
  50.0875,                 -- Your coordinates
  14.4214,
  0,
  100,
  true
);
```

---

### 7. Debugging & Troubleshooting

#### Console Log Checklist

```javascript
// Look for these logs in browser console:
"🔄 useGLTF attempting to load: /models/agents/bus_agent.glb";
"📦 useGLTF returned: Object";
"📏 Model dimensions: { width, height, depth, center }";
"🔷 Mesh found: [name] Material: [type]";
"🎨 AgentGLBModel loaded successfully: ... Meshes: X";
"🎯 Auto-calculated scale: X for max dimension: Y";
```

#### Common Issues & Solutions

| Issue                 | Symptom                      | Solution                                                        |
| --------------------- | ---------------------------- | --------------------------------------------------------------- |
| Wrong model shows     | Robot face instead of custom | Check `agent_type` in database matches key in `agentModelPaths` |
| Model invisible       | Purple sphere or nothing     | Check console for mesh count, verify lighting                   |
| Model too large/small | Doesn't fit in view          | Adjust `targetSize` in auto-scaling (line 72)                   |
| Model not loading     | 404 error                    | Verify file in `/public/models/agents/`                         |
| Wrong rotation        | Spins too fast/slow          | Adjust `spinSpeed` (line 149)                                   |
| Model underground     | Only top visible             | Check Y offset: `-center.y * autoScale`                         |

#### Debug Mode

```javascript
// Add temporary debug sphere to show agent position
<Sphere args={[0.2]} position={[0, 3, 0]}>
  <meshStandardMaterial
    color="#ff00ff"
    emissive="#ff00ff"
    emissiveIntensity={1.0}
  />
</Sphere>
```

---

### 8. Performance Optimization

#### Model Size Recommendations

- **Target File Size**: Under 10MB per model (bus_agent is 60MB - works but heavy)
- **Polygon Count**: 10k-50k triangles recommended
- **Texture Resolution**: 2048x2048 max

#### Optimization Tools

```bash
# Compress GLB files
npx gltf-pipeline -i input.glb -o output.glb -d

# Optimize textures
npx gltf-pipeline -i input.glb -o output.glb --draco.compressionLevel 10
```

---

### 9. Agent Color Coding (Fallback)

When custom models aren't available, agents use colored shapes:

```javascript
// Enhanced3DAgent.jsx lines 169-190
const agentColors = {
  bus_agent: "#00ff00", // Pure green
  train_agent: "#0000ff", // Blue
  hotel_agent: "#32cd32", // Lime green
  flight_agent: "#87ceeb", // Sky blue
  restaurant_agent: "#ff6347", // Tomato
  travel_agent: "#ffd700", // Gold
  payment_terminal: "#ffa500", // Orange
  intelligent_assistant: "#1e90ff", // Dodger blue
};
```

---

### 10. Quick Reference Commands

#### Development

```bash
# Start dev server
npm run dev

# Check port
lsof -ti:5173

# View logs
# Browser console for 3D model debugging
```

#### Git Workflow

```bash
# Stage changes
git add src/components/Enhanced3DAgent.jsx src/hooks/useDatabase.js

# Commit
git commit -m "Add [agent_type] 3D model support"

# Push
git push origin revolut-qr-payments-sim-dynamimic-online-payments-solana-hedera-ai
```

#### File Operations

```bash
# Add new model
cp new_model.glb public/models/agents/

# Check existing models
ls -lh public/models/agents/

# Verify GLB format
file public/models/agents/*.glb
xxd -l 16 public/models/agents/new_model.glb
```

---

## Next Steps for Deploying Additional Agents

### Priority 1: Train Agent

1. **Source/Create** `train_agent.glb` model
2. **Upload** to `/public/models/agents/`
3. **Verify** GLB format and size
4. **Test** locally with `targetSize = 2.0` (trains are larger)
5. **Database** insert with `agent_type = 'train_agent'`
6. **Deploy** and verify in AR view

### Priority 2: Flight Agent

1. Follow same process as train
2. Recommended `targetSize = 1.5`
3. Consider adding slight tilt animation for flight effect

### Future Enhancements

- [ ] Per-agent-type scale configuration
- [ ] Custom animations per agent type
- [ ] LOD (Level of Detail) for performance
- [ ] Model caching strategy
- [ ] Error fallback models per type
- [ ] Agent-specific lighting profiles

---

## Summary of Key Fixes Applied

### 1. Agent Type Preservation

**File**: `src/hooks/useDatabase.js`
**Line**: 273
**Fix**: Properly fallback from `agent_type` → `object_type` → default

### 2. Auto-Scaling System

**File**: `src/components/Enhanced3DAgent.jsx`
**Lines**: 59-73
**Fix**: Calculate bounding box and auto-scale to `targetSize = 1.5`

### 3. Reduced Rotation Speed

**File**: `src/components/Enhanced3DAgent.jsx`
**Line**: 149
**Fix**: Changed from `0.3-0.5` to `0.05-0.10` rad/s

### 4. Improved Lighting

**File**: `src/components/Enhanced3DAgent.jsx`
**Lines**: 95-99
**Fix**: Added ambient + dual directional + point lights

### 5. Debug Logging

**File**: `src/components/Enhanced3DAgent.jsx`
**Lines**: 40-91
**Fix**: Added comprehensive logging for dimensions, meshes, scale

---

## Contact & Support

For issues with 3D model deployment, check:

1. Browser console for detailed logs
2. Network tab for 404 errors on GLB files
3. Database `agent_type` matches `agentModelPaths` keys exactly
4. GLB file integrity with `xxd` command

---

**Last Updated**: November 21, 2025
**Status**: Bus Agent ✅ | Other Agents 📋 Pending
