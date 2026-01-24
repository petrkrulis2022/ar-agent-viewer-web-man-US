# CubePay Engine GIF Creation Guide

Since we need to capture the actual 3D CubePaymentEngine, here's the easiest way:

## Option 1: Manual Screen Recording (Recommended - Works on any OS)

1. **Open the cube demo:**

   - Navigate to http://localhost:5174/cube-demo
   - Click "Launch Payment System"

2. **Record with a screen capture tool:**

   ### On Windows (WSL):

   - Use **ScreenToGif** (free): https://www.screentogif.com/
   - Or **ShareX** with GIF recording

   ### On Linux:

   - Use **Peek**: `sudo apt install peek`
   - Or **gifski** + recordmydesktop

   ### On Mac:

   - Use **GIPHY Capture** (free)
   - Or **LICEcap** (free)

3. **Record settings:**

   - Frame rate: 20-30 fps
   - Duration: 3-5 seconds
   - Focus on just the cube area
   - Let it rotate fully

4. **Save as:** `cubepay_engine_rotating.gif`

## Option 2: Browser DevTools (Chrome/Edge)

1. Open http://localhost:5174/cube-demo
2. Open DevTools (F12)
3. Go to "Performance" tab
4. Click "Screenshots" checkbox
5. Start recording
6. Click "Launch Payment System"
7. Let cube rotate for 3 seconds
8. Stop recording
9. Export screenshots and use a tool to combine them into GIF

## Option 3: Use the Python approach (Already working)

Since you already have Python setup, you can use browser automation:

```bash
# Install Selenium (lighter than Puppeteer)
pip install selenium pillow

# Then use a simple script to capture screenshots
python capture_cube_screenshots.py
```

Would you like me to create the Python/Selenium version instead? It's simpler and works with your existing Python environment.

## Current Files:

- `cubepay_simple_cube.gif` - Simple green cube (no text) ✅ In use
- `cubepay_engine_rotating.gif` - Full engine cube (to be created)
