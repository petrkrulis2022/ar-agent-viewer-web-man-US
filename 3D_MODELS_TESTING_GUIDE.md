# 3D Models Testing Guide

## Quick Test Steps

### 1. Visual Verification

1. Open browser to `http://localhost:5173`
2. Look for agents in AR view
3. **Expected Results**:
   - Payment Terminal agents (Payment Terminal - Peter - Sepolia, Payment Terminal 2 Peter - Sepolia, Trailing Terminal 3 Peter Sepolia) should display **PAX A920 payment terminal device**
   - All other agents (Intelligent Assistants, etc.) should display **humanoid robot face**

### 2. Check Browser Console

Open browser DevTools (F12) and look for:

**Good Signs** ✅:

```
🤖 Enhanced3DAgent rendering for Payment Terminal - Peter - Sepolia:
  agent_type: "payment_terminal"
  isPaymentTerminal: true
  willUseModel: "pax-a920_highpoly"

🤖 Enhanced3DAgent rendering for Peter AI Assistant:
  agent_type: "intelligent_assistant"
  isPaymentTerminal: false
  willUseModel: "humanoid_robot_face"
```

**Bad Signs** ❌:

- `404 Not Found: /models/terminals/humanoid_robot_face.glb`
- `404 Not Found: /models/terminals/pax-a920_highpoly.glb`
- `Error loading GLB model`
- `THREE.GLTFLoader: Unexpected asset`

### 3. Test Interactions

#### Test Payment Terminal

1. Click on "Payment Terminal - Peter - Sepolia" (should show PAX A920 device)
2. Verify it opens payment modal
3. Check that $162 USD amount is displayed
4. Test payment flow (QR code, virtual card)

#### Test Regular Agent

1. Click on any intelligent assistant (should show robot face)
2. Verify modal opens
3. Check interaction works normally

### 4. Test Hover Effects

1. Hover over payment terminal agent
   - Should see **orange particles** orbiting (8 particles)
   - Glow should increase in intensity
2. Hover over regular agent
   - Should see **colored particles** matching agent type (6 particles)
   - Glow should increase in intensity

### 5. Performance Check

- Open DevTools > Performance tab
- Monitor FPS (should stay above 30 FPS)
- Check memory usage (should be stable)
- If FPS drops significantly, may need to reduce model scale or polygon count

## Model Scale Adjustments

If models appear too large or too small, edit `Enhanced3DAgent.jsx`:

### Make Models Smaller

```jsx
const RoboticFaceModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/humanoid_robot_face.glb");
  return <primitive object={scene.clone()} scale={0.3} />; // Changed from 0.5
};

const PaymentTerminalModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/pax-a920_highpoly.glb");
  return <primitive object={scene.clone()} scale={0.4} />; // Changed from 0.6
};
```

### Make Models Larger

```jsx
const RoboticFaceModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/humanoid_robot_face.glb");
  return <primitive object={scene.clone()} scale={0.8} />; // Changed from 0.5
};

const PaymentTerminalModel = ({ hovered }) => {
  const { scene } = useGLTF("/models/terminals/pax-a920_highpoly.glb");
  return <primitive object={scene.clone()} scale={1.0} />; // Changed from 0.6
};
```

## Common Issues & Solutions

### Issue: Models Not Appearing

**Solution**:

- Check browser console for 404 errors
- Verify files exist in `/public/models/terminals/`
- Check file names match exactly (case-sensitive)

### Issue: Models Appear Black

**Solution**:

- Models may need additional lighting
- Try increasing ambient light in AR3DScene.jsx
- Models may have embedded materials that override lighting

### Issue: Models Are Upside Down/Sideways

**Solution**:
Add rotation to model components:

```jsx
<primitive
  object={scene.clone()}
  scale={0.5}
  rotation={[0, Math.PI, 0]} // Rotate 180° on Y axis
/>
```

### Issue: Performance Degradation

**Solution**:

1. Reduce model scales (smaller = better performance)
2. Limit visible agents (already set to max 15)
3. Consider using lower-poly versions of models
4. Disable hover particle effects for distant agents

### Issue: Wrong Model for Agent Type

**Solution**:
Check `object_type` field in database:

```bash
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"
node query-all-terminals.mjs
```

## Testing Payment Scenarios

### Scenario 1: E-shop Payment ($162)

1. Open `http://localhost:5175` (E-shop)
2. Add items to cart
3. Click "Pay with AR Agent"
4. Should redirect to AR Viewer
5. Payment Terminal should show **PAX A920 model**
6. Amount should be $162 USD

### Scenario 2: Crypto On-ramp ($528)

1. Open `http://localhost:5176` (On-ramp)
2. Select amount
3. Click "Pay with AR Agent"
4. Payment Terminal 2 should show **PAX A920 model**
5. Amount should be $528 USD

### Scenario 3: Bus Ticket ($6.50)

1. Directly open AR Viewer
2. Find "Trailing Terminal 3 Peter Sepolia"
3. Should show **PAX A920 model**
4. Click to interact
5. Amount should be $6.50 USD

## Success Checklist

- [ ] Payment terminals display PAX A920 3D model
- [ ] Regular agents display humanoid robot face 3D model
- [ ] Models rotate smoothly (Y-axis spinning)
- [ ] Models float gently (up/down movement)
- [ ] Hover effects work (particles appear, glow increases)
- [ ] Click interactions work (modals open)
- [ ] Payment flows work correctly
- [ ] Correct amounts displayed ($162, $528, $6.50)
- [ ] No console errors
- [ ] Performance is acceptable (>30 FPS)
- [ ] Mobile AR mode works (if testing on mobile)

## Rollback Instructions

If major issues occur:

```bash
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"
git checkout HEAD~1 src/components/Enhanced3DAgent.jsx
```

Then restart dev server:

```bash
lsof -ti:5173 | xargs kill -9
cd "/home/petrunix/agentsphere-full-web-man-US-qr tap/ar-agent-viewer-web-man-US"
npm run dev -- --port 5173
```

---

**Ready to Test!** 🚀
Open `http://localhost:5173` and start testing the new 3D models.
