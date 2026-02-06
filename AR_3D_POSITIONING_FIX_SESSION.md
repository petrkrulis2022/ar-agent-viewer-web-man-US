# AR 3D Positioning & Scaling Fix Session

**Date:** February 6, 2026  
**Branch:** `artm-virtual-terminal-implementation`

## Problem

Two POS terminal 3D objects (POS 1 and POS 2) were:
1. **Overlapping** on screen despite having different database coordinates
2. **Only visible in the top half** of the screen — a horizontal line cut the viewport in half
3. **Too large** on screen

## Root Cause Analysis

### Screen Split Issue
- **ARViewer.jsx**: The 3D container used `style={{ minHeight: "500px" }}` instead of full viewport height, limiting the Three.js Canvas to 500px
- **CameraView.jsx**: The camera feed wrapper used `aspect-video` CSS class (Tailwind), which forces a 16:9 aspect ratio and clips content outside that ratio

### Overlapping Issue
- POS 1 was in `gps` positioning mode with no screen coordinates — it fell back to default position
- POS 2 had screen coordinates but the constrained viewport pushed both into the same visible area

### Size Issue
- `PaymentTerminalPOSModel` and `MyPersonalTerminalModel` both used `scale={3.0}` — far too large for screen-positioned objects

## Fixes Applied

### 1. ARViewer.jsx — Full Viewport Height
```diff
- <div className="relative" style={{ minHeight: "500px" }}>
+ <div className="relative" style={{ height: "100vh", width: "100%" }}>
```

### 2. CameraView.jsx — Remove Aspect Ratio Constraint
```diff
- <div className="relative aspect-video bg-slate-900 overflow-hidden">
+ <div className="relative w-full h-full bg-slate-900 overflow-hidden">
```

Also added `h-full` to the outer `div`, `Card`, and `CardContent` wrappers so height propagates through the full component tree.

### 3. Database — Screen Positioning
Both POS terminals updated to screen positioning mode and moved up:

| Agent | positioning_mode | screen_position_x | screen_position_y |
|-------|-----------------|-------------------|-------------------|
| POS 1 No x,y | screen | 25% | 15% |
| POS 2 with x.y | screen | 75% | 15% |

### 4. Enhanced3DAgent.jsx — Smaller Models
```diff
# PaymentTerminalPOSModel
- scale={3.0}
- position={[0, -4, -3]}
+ scale={0.8}
+ position={[0, -1, -0.8]}

# MyPersonalTerminalModel
- scale={3.0}
- position={[0, -4, -3]}
+ scale={0.8}
+ position={[0, -1, -0.8]}
```

## Files Modified

| File | Change |
|------|--------|
| `src/components/ARViewer.jsx` | 3D container: `minHeight: 500px` → `height: 100vh` |
| `src/components/CameraView.jsx` | Removed `aspect-video`, added `h-full` to Card chain |
| `src/components/Enhanced3DAgent.jsx` | POS model scale `3.0` → `0.8`, adjusted positions |
| **Database** (`deployed_objects`) | Both POS agents set to screen mode at (25%,15%) and (75%,15%) |

## Supabase Connection Note

The project migrated to new Supabase API keys (stored in `.env`):
- **Publishable key** is read-only due to RLS
- **Secret key** is required for DB writes (bypasses RLS)
- Legacy JWT keys are **disabled** as of 2025-10-26
