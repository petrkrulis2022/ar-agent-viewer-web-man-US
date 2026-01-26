# CubePay Button Design Guide for AgentSphere

## Primary Button Style (Main Action Buttons)

Use this design for primary call-to-action buttons in AgentSphere to match CubePay's design language.

### React/Tailwind CSS Button Classes

```jsx
<Button
  onClick={handleClick}
  size="lg"
  className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
>
  Button Text
</Button>
```

### Key Design Elements

1. **Gradient Background**

   - Base: `bg-gradient-to-br from-green-400 to-green-600`
   - RGB: from rgb(74, 222, 128) to rgb(22, 163, 74)
   - Hover: `hover:from-green-500 hover:to-green-700`
   - RGB Hover: from rgb(34, 197, 94) to rgb(21, 128, 61)

2. **Text Styling**

   - Color: `text-black` (black text on green gradient)
   - Font: `font-semibold`
   - Size: `text-sm` (can be adjusted based on button importance)

3. **Spacing**

   - Padding: `px-3 py-6` (horizontal 12px, vertical 24px)
   - Min Height: `min-h-[80px] sm:min-h-[100px]` (80px mobile, 100px desktop)

4. **Border & Shadow**

   - Border Radius: `rounded-2xl` (16px rounded corners)
   - Bottom Border: `border-b-4 border-green-700` (4px green bottom border for depth)
   - Shadow: `shadow-xl hover:shadow-2xl shadow-green-500/30` (green glow effect)

5. **Animations**

   - Transition: `transition-all duration-200` (smooth 200ms transitions)
   - Hover Scale: `hover:scale-105` (5% size increase on hover)

6. **Layout**
   - Display: `flex flex-col items-center justify-center` (centered content)

## Secondary/Navigation Button Style

For navigation and secondary actions (footer buttons, etc.):

```jsx
<button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
  <Icon className="w-5 h-5" />
  <span className="text-xs font-medium">Button Label</span>
</button>
```

### Key Features

- Default text: `text-slate-400` rgb(148, 163, 184)
- Hover text: `hover:text-white` rgb(255, 255, 255)
- Icon size: `w-5 h-5` (20x20px)
- Text size: `text-xs font-medium` (12px)
- Spacing: `space-y-1` (4px between icon and text)
- Padding: `p-2` (8px all sides)

## Status/Info Button Style

For status indicators and informational buttons:

```jsx
<div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-white/10">
  <Icon className="w-4 h-4 text-green-400" />
  <span className="text-xs font-medium text-green-400">Status Text</span>
</div>
```

### Key Features

- Background: `bg-slate-800/50` rgba(30, 41, 59, 0.5) with `backdrop-blur-sm`
- Border: `border border-white/10` rgba(255, 255, 255, 0.1)
- Border Radius: `rounded-lg` (8px)
- Icon: `w-4 h-4 text-green-400` rgb(74, 222, 128)
- Text: `text-xs font-medium text-green-400`

## Button Layout Grid

For 2x2 button grids (like CubePay main screen):

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {/* 4 primary buttons here */}
</div>
```

For narrow navigation (2 column layout):

```jsx
<nav className="grid grid-cols-2 gap-3">{/* Navigation buttons here */}</nav>
```

## Complete Example

```jsx
import { Button } from "@/components/ui/button";
import { Zap, MapPin } from "lucide-react";

// Primary CTA Button
<Button
  onClick={() => console.log('Primary action')}
  size="lg"
  className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-black font-semibold px-3 py-6 text-sm rounded-2xl transition-all duration-200 hover:scale-105 shadow-xl hover:shadow-2xl shadow-green-500/30 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] border-b-4 border-green-700"
>
  Deploy Agent
</Button>

// Navigation Button
<button className="flex flex-col items-center space-y-1 p-2 text-slate-400 hover:text-white transition-colors">
  <MapPin className="w-5 h-5" />
  <span className="text-xs font-medium">Agent Map</span>
</button>

// Status Button
<div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-white/10">
  <Zap className="w-4 h-4 text-green-400" />
  <span className="text-xs font-medium text-green-400">
    Active: 54
  </span>
</div>
```

## Color References

All colors match the CubePay color scheme:

- **Primary Green**: rgb(74, 222, 128) / #4ade80 (green-400)
- **Dark Green**: rgb(22, 163, 74) / #16a34a (green-600)
- **Hover Green**: rgb(34, 197, 94) / #22c55e (green-500)
- **Border Green**: rgb(21, 128, 61) / #15803d (green-700)
- **Background Dark**: rgb(15, 23, 42) / #0f172a (slate-900)
- **Panel Background**: rgba(30, 41, 59, 0.5) (slate-800/50)
- **Text Gray**: rgb(148, 163, 184) / #94a3b8 (slate-400)
- **Border White**: rgba(255, 255, 255, 0.1)

## Usage Notes

1. Use primary button style for main actions (Deploy, Pay, Submit, etc.)
2. Use navigation button style for footer/menu items
3. Use status button style for read-only information displays
4. Always include hover states for interactive elements
5. Maintain consistent spacing with Tailwind's spacing scale
6. Use `backdrop-blur-sm` for glass-morphism effects on panels
7. Apply `border-b-4` to primary buttons for 3D depth effect
