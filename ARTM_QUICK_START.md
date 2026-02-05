# ARTM Quick Start Guide 🚀

## For Developers Testing the Feature

### Step 1: Verify Files Created ✅

Check these files exist in your repository:

```bash
src/constants/zIndexConfig.js
src/components/ARTMDisplayModal.jsx
src/components/CardWithdrawalModal.jsx
src/components/CryptoWithdrawalModal.jsx
```

Check these files were modified:

```bash
src/components/Enhanced3DAgent.jsx  # Virtual Terminal 3D rendering
src/components/CameraView.jsx       # ARTM modal integration
```

### Step 2: Test Virtual Terminal 3D Model

1. Open AR Viewer in browser
2. Deploy a Virtual Terminal agent via AgentSphere with:

   - Agent Type: "Virtual Terminal"
   - Bank Integrations: Revolut (checked)
   - Exchange Integrations: Binance (checked)
   - Mock Balance EUR: 2450.67
   - Mock Wallet USDC: 1250.00

3. Find the agent in AR view
4. **Expected:** ATM terminal should appear fully visible (not clipped)
5. **Expected:** Blue glow particles on hover

**Troubleshooting:**

- If model is cut off: Check console for "Model assignment check" log
- If no model shows: Verify `agent_type === "Virtual Terminal"` in database
- If wrong object: Clear browser cache and reload

### Step 3: Test Card Withdrawal Flow 💳

1. Click Virtual Terminal → ARTMDisplayModal opens
2. Click "TAP ON CARD 🏦" button
3. Select Revolut → Balance shows €2,450.67
4. Enter €100 (or use quick button)
5. Confirm → 3-second processing animation
6. **Expected:** Success screen with receipt showing:
   - Amount: €100.00
   - Bank: Revolut
   - Transaction ID: ARTM-{timestamp}
   - Date/time
   - Terminal name

**Troubleshooting:**

- If button disabled: Check `bank_integrations` includes 'Revolut'
- If amount rejected: Must be > 0 and ≤ balance
- If modal doesn't open: Check CameraView conditional rendering

### Step 4: Test Crypto Withdrawal Flow 💰

1. Click "TAP ON WALLET 💰" button
2. Select Binance
3. Click MetaMask → Mock connection (address: 0x742d...3f5a)
4. Approve spending limit (1,000 USDC)
5. Balance shows 1,250.00 USDC (≈€1,150.00)
6. Enter 100 USDC
7. **Expected:** Shows ≈€92.00 EUR conversion
8. Confirm → 4-second processing
9. **Expected:** Success screen with receipt showing:
   - Sent: 100.00 USDC
   - Received: €92.00
   - Exchange: Binance
   - Wallet: 0x742d...3f5a
   - Blockchain TX: 0x{hash}...{hash}

**Troubleshooting:**

- If wallet button missing: Check `exchange_integrations` includes exchange name
- If conversion wrong: Should be USDC \* 0.92 = EUR
- If processing stuck: Check browser console for errors

### Step 5: Verify Camera Feed Visibility 📹

**Critical:** Camera feed should remain visible behind ALL ARTM modals

1. Open any ARTM modal
2. **Expected:** Semi-transparent overlay with blur effect
3. **Expected:** Camera feed visible behind modal
4. **Expected:** Can see AR scene behind modal content

**Z-Index Layers (from bottom to top):**

- Camera feed: 0
- AR scene: 10
- Standard modals: 30
- ARTM display: 40
- ARTM flow modals: 50

### Step 6: Test Non-ARTM Agents (Regression)

**Important:** Make sure other agent types still work!

1. Click a Payment Terminal agent
2. **Expected:** AgentInteractionModal opens (NOT ARTMDisplayModal)
3. **Expected:** Standard chat/payment interface
4. **Expected:** All existing features work normally

---

## For AgentSphere Team

### Required Changes in DeployObject.tsx

**Location:** `agentsphere-full-web-man-US/src/components/DeployObject.tsx`

**1. Replace MCP Interactions (around line 1500-1600)**

Remove this:

```typescript
{/* MCP Server Interactions */}
<div className="mcp-interactions">
  <Select label="MCP Services" ... />
</div>
```

Add this:

```typescript
{/* Bank & Exchange Integrations */}
<div className="bank-exchange-integrations">
  <Label>Bank Integrations</Label>
  <Checkbox label="Revolut" defaultChecked onChange={...} />
  <Checkbox label="ČSOB" onChange={...} />
  <Checkbox label="Raiffeisen" onChange={...} />

  <Label>Exchange Integrations</Label>
  <Checkbox label="Binance" onChange={...} />
  <Checkbox label="Coinbase" onChange={...} />
</div>
```

**2. Add Terminal Display Config**

```typescript
{
  agentType === "Virtual Terminal" && (
    <Card>
      <CardHeader>Terminal Display Configuration</CardHeader>
      <CardContent>
        <Input
          label="Mock Balance (EUR)"
          type="number"
          defaultValue={2450.67}
        />
        <Input label="Mock Wallet (USDC)" type="number" defaultValue={1250.0} />
        <Input label="Cash Dispenser ID" defaultValue="ARTM-001" />
        <Select label="UI Theme" options={["revolut", "classic", "modern"]} />
      </CardContent>
    </Card>
  );
}
```

**3. Hide Payment Methods for Virtual Terminals**

```typescript
{
  agentType !== "Virtual Terminal" && (
    <Card>
      <CardHeader>Payment Methods</CardHeader>
      {/* Existing payment methods UI */}
    </Card>
  );
}
```

**4. Update Database Insert**

```typescript
const { data, error } = await supabase.from("deployed_objects").insert({
  // ... existing fields
  bank_integrations: formData.bankIntegrations, // string[]
  exchange_integrations: formData.exchangeIntegrations, // string[]
  terminal_display_config: {
    // JSONB
    mock_balance_eur: formData.mockBalanceEur,
    mock_wallet_usdc: formData.mockWalletUsdc,
    dispenser_id: formData.dispenserId,
    ui_theme: formData.uiTheme,
  },
});
```

---

## Common Issues & Solutions

### Issue: "ARTM modal doesn't open"

**Solution:** Check CameraView.jsx line ~968:

```javascript
{selectedAgent?.agent_type === "Virtual Terminal" ? (
  <ARTMDisplayModal ... />
) : (
  <AgentInteractionModal ... />
)}
```

### Issue: "3D model is cut off / clipped"

**Solution:** Check Enhanced3DAgent.jsx Virtual Terminal block:

```javascript
<VirtualATMModel
  scale={0.4}
  position={[0, 0, 0]} // Must be [0, 0, 0] not [0, -2.0, 0]
  rotation={[0, 0, 0]}
/>
```

### Issue: "Camera feed not visible behind modal"

**Solution:** Check ARTMDisplayModal backgroundColor:

```javascript
backgroundColor: 'rgba(0, 0, 0, 0.3)',  // Semi-transparent
backdropFilter: 'blur(4px)',
```

### Issue: "Bank/exchange buttons disabled"

**Solution:** Check agent database record has:

```json
{
  "bank_integrations": ["Revolut"],
  "exchange_integrations": ["Binance"]
}
```

---

## Testing Checklist (Copy-Paste for QA)

```
[ ] 3D Model Rendering
    [ ] ATM model fully visible (no clipping)
    [ ] Blue glow on hover
    [ ] Proper scale (not too big/small)

[ ] Card Withdrawal Flow
    [ ] ARTMDisplayModal opens with camera visible
    [ ] TAP ON CARD button works
    [ ] Revolut selection works
    [ ] Balance displays €2,450.67
    [ ] Amount input validates correctly
    [ ] Quick buttons work (€20, €50, €100, €200)
    [ ] Confirmation shows all details
    [ ] Processing animation runs 3 seconds
    [ ] Success screen shows receipt
    [ ] Transaction ID format: ARTM-{number}

[ ] Crypto Withdrawal Flow
    [ ] TAP ON WALLET button works
    [ ] Exchange selection (Binance/Coinbase)
    [ ] Wallet connection (MetaMask/Phantom)
    [ ] Spending limit approval screen
    [ ] Balance shows 1,250.00 USDC
    [ ] EUR conversion displays (1 USDC = €0.92)
    [ ] Amount input with quick buttons
    [ ] Confirmation with blockchain details
    [ ] Processing runs 4 seconds
    [ ] Success with TX hash in receipt

[ ] Modal Behavior
    [ ] Camera feed visible behind all modals
    [ ] Back buttons navigate correctly
    [ ] Close (X) button works
    [ ] Click outside modal to dismiss
    [ ] Modal stacking order correct

[ ] Integration Status
    [ ] Enabled banks show as available
    [ ] Disabled banks show greyed out
    [ ] Terminal config values used correctly

[ ] Regression Testing
    [ ] Non-ARTM agents use AgentInteractionModal
    [ ] Payment Terminal agents work normally
    [ ] Chat functionality unaffected
    [ ] Other payment methods work
```

---

## Performance Benchmarks

Expected performance (measured in Chrome DevTools):

- ARTM modal open: < 100ms
- Step transition: < 50ms
- 3D model initial load: < 500ms
- Subsequent renders: < 16ms (60fps)
- Processing animations: Exactly 3s (card) / 4s (crypto)

**To test:**

```javascript
// In browser console
console.time("modal-open");
// Click terminal
console.timeEnd("modal-open");
```

---

## Contact

**Questions?** Check:

1. `/ARTM_IMPLEMENTATION_COMPLETE.md` - Full documentation
2. Code comments in component files
3. Console logs (search for "Virtual Terminal" or "ARTM")

**Found a bug?** Check:

1. Browser console for errors
2. Network tab for failed requests
3. React DevTools for component state

---

_Last Updated: February 5, 2026_  
_Version: 1.0.0_  
_Status: Ready for Testing_
