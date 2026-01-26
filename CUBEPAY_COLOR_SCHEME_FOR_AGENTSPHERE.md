# CubePay Color Scheme for AgentSphere

## Objective

Apply the exact same color scheme from CubePay to AgentSphere for visual consistency across both applications.

## Color Palette (RGB & Hex Values)

### Background Colors

**Main Background Gradient:**

- From: `rgb(15, 23, 42)` - Slate 900 - `#0f172a`
- Via: `rgb(88, 28, 135)` - Purple 900 - `#581c87`
- To: `rgb(15, 23, 42)` - Slate 900 - `#0f172a`
- CSS: `background: linear-gradient(to bottom right, rgb(15, 23, 42), rgb(88, 28, 135), rgb(15, 23, 42))`

**Footer Background:**

- Color: `rgb(15, 23, 42)` with 80% opacity - Slate 900/80 - `rgba(15, 23, 42, 0.8)`
- Backdrop blur applied
- Border top: `rgba(255, 255, 255, 0.1)` - White/10

### Card/Panel Colors

**Status Panel Background:**

- Color: `rgb(30, 41, 59)` with 50% opacity - Slate 800/50 - `rgba(30, 41, 59, 0.5)`
- Border: `rgba(255, 255, 255, 0.1)` - White/10
- Backdrop blur applied

**Status Item Background:**

- Color: `rgb(51, 65, 85)` with 30% opacity - Slate 700/30 - `rgba(51, 65, 85, 0.3)`

### Button Colors

**Primary Green Buttons:**

- Gradient From: `rgb(74, 222, 128)` - Green 400 - `#4ade80`
- Gradient To: `rgb(22, 163, 74)` - Green 600 - `#16a34a`
- Hover From: `rgb(34, 197, 94)` - Green 500 - `#22c55e`
- Hover To: `rgb(21, 128, 61)` - Green 700 - `#15803d`
- Border Bottom: `rgb(21, 128, 61)` - Green 700 - `#15803d`
- Text Color: `rgb(0, 0, 0)` - Black - `#000000`
- Shadow: `rgba(74, 222, 128, 0.3)` - Green 500/30
- CSS: `background: linear-gradient(to bottom right, rgb(74, 222, 128), rgb(22, 163, 74))`

**Wallet/Purple Buttons:**

- Background: `rgb(147, 51, 234)` - Purple 600 - `#9333ea`
- Hover: `rgb(126, 34, 206)` - Purple 700 - `#7e22ce`
- Border: `rgba(168, 85, 247, 0.5)` - Purple 500/50 - `rgba(168, 85, 247, 0.5)`
- Text: `rgb(255, 255, 255)` - White - `#ffffff`

### Text Colors

**Primary Heading (CubePay/AgentSphere title):**

- Color: `rgb(74, 222, 128)` - Green 400 - `#4ade80`

**Body Text:**

- Color: `rgb(255, 255, 255)` - White - `#ffffff`

**Status Text (Active/Connected):**

- Color: `rgb(74, 222, 128)` - Green 400 - `#4ade80`

**Secondary/Muted Text:**

- Color: `rgb(148, 163, 184)` - Slate 400 - `#94a3b8`

**Navigation Icons (Inactive):**

- Color: `rgb(148, 163, 184)` - Slate 400 - `#94a3b8`
- Hover: `rgb(255, 255, 255)` - White - `#ffffff`

### Icon/Accent Colors

**Status Icons Background:**

- Color: `rgba(74, 222, 128, 0.2)` - Green 500/20 - `rgba(74, 222, 128, 0.2)`

**Check/Success Icons:**

- Color: `rgb(74, 222, 128)` - Green 400 - `#4ade80`

**Border/Divider:**

- Color: `rgba(255, 255, 255, 0.1)` - White/10

## Implementation Guide

### For Tailwind CSS Classes:

```jsx
// Main container
className =
  "min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white";

// Header
className = "border-b border-white/10";

// Footer
className = "border-t border-white/10 bg-slate-900/80 backdrop-blur-sm";

// Status Panel
className =
  "bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl";

// Status Items
className = "bg-slate-700/30 rounded-lg";

// Primary Green Buttons
className =
  "bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold border-b-4 border-green-700 shadow-xl shadow-green-500/30";

// Purple Wallet Button
className =
  "bg-purple-600 hover:bg-purple-700 text-white border border-purple-500/50";

// Green Headings
className = "text-green-400";

// Muted Text
className = "text-slate-400";
```

### For Plain CSS:

```css
/* Main Background */
.main-container {
  background: linear-gradient(
    to bottom right,
    rgb(15, 23, 42),
    rgb(88, 28, 135),
    rgb(15, 23, 42)
  );
  color: rgb(255, 255, 255);
}

/* Footer */
.footer {
  background-color: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Status Panel */
.status-panel {
  background-color: rgba(30, 41, 59, 0.5);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 1rem;
}

/* Status Items */
.status-item {
  background-color: rgba(51, 65, 85, 0.3);
  border-radius: 0.5rem;
}

/* Primary Button */
.primary-button {
  background: linear-gradient(
    to bottom right,
    rgb(74, 222, 128),
    rgb(22, 163, 74)
  );
  color: rgb(0, 0, 0);
  border-bottom: 4px solid rgb(21, 128, 61);
  box-shadow: 0 10px 40px rgba(74, 222, 128, 0.3);
}

.primary-button:hover {
  background: linear-gradient(
    to bottom right,
    rgb(34, 197, 94),
    rgb(21, 128, 61)
  );
}

/* Purple Button */
.purple-button {
  background-color: rgb(147, 51, 234);
  color: rgb(255, 255, 255);
  border: 1px solid rgba(168, 85, 247, 0.5);
}

.purple-button:hover {
  background-color: rgb(126, 34, 206);
}

/* Green Heading */
.green-heading {
  color: rgb(74, 222, 128);
}

/* Muted Text */
.muted-text {
  color: rgb(148, 163, 184);
}
```

## Quick Reference Table

| Element                   | Color Name | RGB                | Hex     | Opacity |
| ------------------------- | ---------- | ------------------ | ------- | ------- |
| Background Start          | Slate 900  | rgb(15, 23, 42)    | #0f172a | 100%    |
| Background Middle         | Purple 900 | rgb(88, 28, 135)   | #581c87 | 100%    |
| Background End            | Slate 900  | rgb(15, 23, 42)    | #0f172a | 100%    |
| Footer BG                 | Slate 900  | rgb(15, 23, 42)    | #0f172a | 80%     |
| Panel BG                  | Slate 800  | rgb(30, 41, 59)    | #1e293b | 50%     |
| Item BG                   | Slate 700  | rgb(51, 65, 85)    | #334155 | 30%     |
| Button Green (From)       | Green 400  | rgb(74, 222, 128)  | #4ade80 | 100%    |
| Button Green (To)         | Green 600  | rgb(22, 163, 74)   | #16a34a | 100%    |
| Button Green Hover (From) | Green 500  | rgb(34, 197, 94)   | #22c55e | 100%    |
| Button Green Hover (To)   | Green 700  | rgb(21, 128, 61)   | #15803d | 100%    |
| Button Purple             | Purple 600 | rgb(147, 51, 234)  | #9333ea | 100%    |
| Button Purple Hover       | Purple 700 | rgb(126, 34, 206)  | #7e22ce | 100%    |
| Green Text                | Green 400  | rgb(74, 222, 128)  | #4ade80 | 100%    |
| White Text                | White      | rgb(255, 255, 255) | #ffffff | 100%    |
| Muted Text                | Slate 400  | rgb(148, 163, 184) | #94a3b8 | 100%    |
| Border/Divider            | White      | rgb(255, 255, 255) | #ffffff | 10%     |

## Additional Effects

- **Backdrop Blur**: `backdrop-filter: blur(12px)` on panels and footer
- **Button Shadow**: `box-shadow: 0 10px 40px rgba(74, 222, 128, 0.3)` for green buttons
- **Hover Scale**: `transform: scale(1.05)` on button hover
- **Border Radius**:
  - Large panels: `1rem` (16px)
  - Buttons: `1rem` (16px)
  - Small items: `0.5rem` (8px)

## Usage Notes

1. **Consistency**: Use these exact RGB values to ensure perfect color matching between CubePay and AgentSphere
2. **Gradients**: Always use `linear-gradient(to bottom right, ...)` for directional consistency
3. **Opacity**: When using opacity, always apply it via rgba() or /XX notation (Tailwind) rather than separate opacity property
4. **Backdrop Blur**: Essential for the modern glassmorphism effect - don't skip this
5. **Shadows**: Green buttons should always have the green-tinted shadow for depth and consistency

## Example Component

```jsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
  <footer className="border-t border-white/10 bg-slate-900/80 backdrop-blur-sm">
    <div className="bg-slate-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
      <h3 className="text-green-400 text-center mb-3">Network Status</h3>
      <div className="bg-slate-700/30 rounded-lg p-2">
        <span className="text-green-400">Active</span>
        <span className="text-slate-400">Details</span>
      </div>
      <button className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold rounded-2xl px-4 py-6 border-b-4 border-green-700 shadow-xl shadow-green-500/30">
        Click Me
      </button>
    </div>
  </footer>
</div>
```
