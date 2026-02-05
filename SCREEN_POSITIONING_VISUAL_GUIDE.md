# Screen Positioning Visual Guide

## Agent Placement Examples

### Screen-Positioned Agents (Fixed Locations)

```
┌─────────────────────────────────────────────────┐
│                                          📺 🌍  │ ← Top-Right (85%, 15%)
│                                          (●)    │   Screen Test Agent
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│                     📺 🌍                       │ ← Center (50%, 50%)
│                      (●)                        │   Welcome Agent
│                                                 │
│                                                 │
│                                                 │
│                                                 │
│  📺 🌍                                          │ ← Bottom-Left (10%, 90%)
│  (●)                                            │   Chat Agent
│                                                 │
└─────────────────────────────────────────────────┘

Legend:
📺 = Screen-positioned (Blue badge)
🌍 = GPS-positioned (Green badge)
(●) = Agent marker
```

---

## Common Screen Positions

### Corners

```javascript
TOP_LEFT:     { x: 10,  y: 10 }   // Header area
TOP_RIGHT:    { x: 90,  y: 10 }   // Notifications
BOTTOM_LEFT:  { x: 10,  y: 90 }   // Chat/Help
BOTTOM_RIGHT: { x: 90,  y: 90 }   // Actions
```

### Edges (Centered)

```javascript
TOP_CENTER:    { x: 50, y: 10 }   // Title bar
BOTTOM_CENTER: { x: 50, y: 90 }   // Footer
LEFT_CENTER:   { x: 10, y: 50 }   // Side menu
RIGHT_CENTER:  { x: 90, y: 50 }   // Side panel
```

### Center

```javascript
CENTER: { x: 50, y: 50 }           // Main focus
```

---

## Responsive Behavior Across Devices

### Phone Portrait (375x667)

```
┌───────────┐
│     📺    │ ← 85%, 15%
│           │
│           │
│     📺    │ ← 50%, 50%
│           │
│           │
│  📺       │ ← 10%, 90%
└───────────┘
```

### Phone Landscape (667x375)

```
┌─────────────────────────────────┐
│                           📺    │ ← 85%, 15%
│             📺                  │ ← 50%, 50%
│  📺                             │ ← 10%, 90%
└─────────────────────────────────┘
```

### Tablet (768x1024)

```
┌─────────────────┐
│           📺    │ ← 85%, 15%
│                 │
│                 │
│        📺       │ ← 50%, 50%
│                 │
│                 │
│  📺             │ ← 10%, 90%
└─────────────────┘
```

### Desktop (1920x1080)

```
┌───────────────────────────────────────────────────────────┐
│                                                     📺    │ ← 85%, 15%
│                                                           │
│                             📺                            │ ← 50%, 50%
│                                                           │
│  📺                                                       │ ← 10%, 90%
└───────────────────────────────────────────────────────────┘
```

**Notice:** The percentage positions remain consistent, but pixel locations adapt to screen size.

---

## Mixed GPS + Screen Agents

```
┌─────────────────────────────────────────────────┐
│                                          📺     │ ← Screen agent (fixed)
│                                          (●)    │
│                                                 │
│              🌍                                 │ ← GPS agent (245m away)
│             (●)                                 │   Position calculated
│                                                 │   from real location
│         🌍                                      │
│        (●)                                      │ ← GPS agent (180m away)
│                     📺                          │
│                     (●)                         │ ← Screen agent (fixed)
│                                                 │
│  📺                                             │ ← Screen agent (fixed)
│  (●)                                            │
│                                                 │
└─────────────────────────────────────────────────┘

Both positioning modes work together seamlessly!
```

---

## Use Cases for Screen Positioning

### 1. **UI Overlays**

- Navigation menus
- Settings buttons
- Notification centers
- Status indicators

### 2. **Streaming Platforms**

- Chat moderators
- Donation alerts
- Subscriber notifications
- Interactive polls

### 3. **AR Shopping**

- Shopping cart (bottom-right)
- Product categories (top)
- Customer support (bottom-left)
- Checkout button (center)

### 4. **AR Games**

- Score display (top-right)
- Health bar (top-left)
- Inventory (bottom-right)
- Map (bottom-left)

### 5. **AR Education**

- Instructor avatar (top-center)
- Course materials (left)
- Quiz interface (center)
- Progress tracker (bottom)

---

## Code Examples

### Deploy Screen Agent (AgentSphere)

```javascript
// User clicks camera at position (x: 320px, y: 100px)
// Viewport size: (width: 400px, height: 600px)

const screenPosition = {
  x: (320 / 400) * 100, // = 80%
  y: (100 / 600) * 100, // = 16.67%
};

await supabase.from("deployed_objects").insert({
  name: "Welcome Agent",
  positioning_mode: "screen",
  screen_position_x: 80.0,
  screen_position_y: 16.67,
  // GPS fallback
  latitude: userLocation.latitude,
  longitude: userLocation.longitude,
});
```

### Render in AR Viewer (Automatic)

```javascript
// Agent data from database:
{
  name: "Welcome Agent",
  positioning_mode: "screen",
  screen_position_x: 80.0,
  screen_position_y: 16.67
}

// ARAgentOverlay.jsx automatically renders at:
<div style={{
  left: '80%',      // From screen_position_x
  top: '16.67%'     // From screen_position_y
}}>
  {/* Agent marker */}
</div>
```

---

## Debug Console Output

### Screen Agent Detected

```
📺 Screen-positioned agent: Welcome Agent at (80.0%, 16.7%)
```

### Screen → AR Conversion (for 3D view)

```
📺 Screen → AR conversion: (80.0%, 16.7%) → 3D(2.15, 1.38, -5.00)
```

### GPS Agent Detected

```
📡 GPS positioning for Local Guide: distance=245m, lat=0.000060, lon=0.000050
📍 Final position for Local Guide: (62.5%, 38.2%)
```

### Viewport Resize

```
📱 Viewport resized: {width: 1024, height: 768}
🔄 Recalculating positions for 2 screen-positioned agents
```

---

## Testing Matrix

| Device Type | Resolution | Screen Agent Position      | GPS Agent Position  | Result  |
| ----------- | ---------- | -------------------------- | ------------------- | ------- |
| iPhone 12   | 390x844    | (80%, 17%) = 312px, 143px  | Calculated from GPS | ✅ Pass |
| iPad Pro    | 1024x1366  | (80%, 17%) = 819px, 232px  | Calculated from GPS | ✅ Pass |
| Desktop     | 1920x1080  | (80%, 17%) = 1536px, 183px | Calculated from GPS | ✅ Pass |
| Rotate 90°  | 844x390    | (80%, 17%) = 675px, 66px   | Calculated from GPS | ✅ Pass |

**Key Insight:** Percentage coordinates ensure visual consistency across all devices!

---

## Performance Comparison

### GPS Agent Rendering

```javascript
// Calculate distance (2 operations)
const distanceKm = Math.sqrt(
  Math.pow(latDiff * 111000, 2) + Math.pow(lonDiff * 111000, 2),
);

// Calculate bearing (1 operation)
const bearing = Math.atan2(lonDiff, latDiff);

// Calculate display position (3 operations)
const displayRadius = 20 + normalizedDistance * 25;
let x = 50 + Math.sin(bearing) * displayRadius;
let y = 50 - Math.cos(bearing) * displayRadius;

// Total: 6 mathematical operations
```

### Screen Agent Rendering

```javascript
// Direct position (0 operations)
const position = {
  x: agent.screen_position_x, // 80.0
  y: agent.screen_position_y, // 16.67
};

// Total: 0 mathematical operations
```

**Result:** Screen agents render **instantaneously** with zero overhead!

---

**Visual Guide Version:** 1.0  
**Last Updated:** February 5, 2026  
**Status:** Complete
