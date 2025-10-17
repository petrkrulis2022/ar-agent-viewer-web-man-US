# 🚨 CORS Error - Backend Fix Required

**Date**: October 15, 2025  
**Issue**: Frontend cannot connect to AgentSphere backend  
**Status**: ⚠️ **BLOCKED - Backend CORS configuration needed**

---

## 🐛 Problem

The AR Viewer frontend is trying to connect to the AgentSphere backend at:

```
https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order
```

But the request is being blocked with this error:

```
Access to fetch at 'https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order'
from origin 'http://localhost:5173' has been blocked by CORS policy:
Response to preflight request doesn't pass access control check:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

---

## 🔍 Root Cause

**CORS (Cross-Origin Resource Sharing)** prevents the browser from making requests between different origins for security reasons.

- **Frontend Origin**: `http://localhost:5173` (AR Viewer)
- **Backend Origin**: `https://8323ecb51478.ngrok-free.app` (AgentSphere via ngrok)

These are **different origins**, so the backend must explicitly allow requests from the frontend.

---

## ✅ Solution for Backend Team

### **For AgentSphere Backend Copilot:**

The backend needs to add CORS headers to allow requests from the AR Viewer frontend.

### **Quick Fix (Development)**

Add CORS middleware to allow all origins (for testing only):

```javascript
// In your backend server setup (e.g., Express.js)

// Option 1: Using cors package
const cors = require("cors");
app.use(cors());

// Option 2: Manual CORS headers
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});
```

### **Secure Fix (Production)**

Only allow specific origins:

```javascript
const cors = require("cors");

const allowedOrigins = [
  "http://localhost:5173", // Local development
  "http://localhost:5175", // Alternative local port
  "https://your-netlify-app.netlify.app", // Production frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true, // Allow cookies/auth headers
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
```

### **For Ngrok-Specific Issues**

If using ngrok, you may also need to handle the ngrok warning page. Add this to your backend:

```javascript
app.use((req, res, next) => {
  // Skip ngrok warning page
  res.header("ngrok-skip-browser-warning", "true");
  next();
});
```

---

## 🧪 Testing the Fix

### **1. After backend adds CORS headers:**

```bash
# Test from terminal
curl -X POST https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d '{"amount": 10.50, "currency": "GBP", "agentId": "test_123"}'

# Should return: {"success": true, "order": {...}}
# With header: Access-Control-Allow-Origin: *
```

### **2. Test from browser console:**

```javascript
// Open http://localhost:5173 in browser
// Open DevTools Console and run:

fetch("https://8323ecb51478.ngrok-free.app/api/revolut/create-bank-order", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    amount: 10.5,
    currency: "GBP",
    agentId: "test_123",
  }),
})
  .then((r) => r.json())
  .then((data) => console.log("✅ CORS working:", data))
  .catch((err) => console.error("❌ CORS still blocked:", err));
```

If you see `✅ CORS working`, the backend is configured correctly!

---

## 📝 Checklist for Backend Team

- [ ] Install CORS package: `npm install cors`
- [ ] Add CORS middleware to server setup
- [ ] Allow `http://localhost:5173` origin
- [ ] Allow `POST` method for `/api/revolut/create-bank-order`
- [ ] Allow headers: `Content-Type`, `Authorization`
- [ ] Handle `OPTIONS` preflight requests
- [ ] Test with curl command (see above)
- [ ] Test from browser console (see above)
- [ ] Restart backend server
- [ ] Notify AR Viewer team that CORS is fixed

---

## 🔄 Temporary Workaround (AR Viewer)

Until CORS is fixed on the backend, the AR Viewer is using **mock mode**:

```javascript
// src/services/revolutBankService.js
const USE_MOCK = true; // ✅ Currently enabled for testing
```

This allows you to:

- ✅ Test the complete UI flow
- ✅ See QR codes generate (mock data)
- ✅ Test countdown timers
- ✅ Test cancel/success flows
- ❌ But payments won't actually process

### **To Switch Back to Production Mode:**

Once backend CORS is fixed:

1. Set `USE_MOCK = false` in `src/services/revolutBankService.js`
2. Refresh the browser
3. Test clicking Bank QR face again
4. Should connect to real backend! 🎉

---

## 📊 Expected Flow After CORS Fix

```
┌──────────────┐                                      ┌─────────────────┐
│  AR Viewer   │                                      │   AgentSphere   │
│  Frontend    │                                      │    Backend      │
│  :5173       │                                      │  ngrok.app      │
└──────┬───────┘                                      └────────┬────────┘
       │                                                        │
       │ 1. Click Bank QR Face                                │
       │                                                        │
       │ 2. POST /api/revolut/create-bank-order               │
       │    Origin: http://localhost:5173                      │
       ├───────────────────────────────────────────────────────>│
       │                                                        │
       │                              3. Backend checks CORS    │
       │                                 - Is origin allowed?   │
       │                                 - ✅ YES! localhost:5173│
       │                                                        │
       │ 4. Response with CORS headers                         │
       │    Access-Control-Allow-Origin: http://localhost:5173 │
       │<───────────────────────────────────────────────────────┤
       │    { success: true, order: {...} }                    │
       │                                                        │
       │ 5. Display QR Code ✅                                 │
       │                                                        │
```

---

## 💡 Why CORS Exists

CORS is a security feature that:

- Prevents malicious websites from stealing data
- Requires servers to explicitly allow cross-origin requests
- Protects users from CSRF attacks

**Without CORS**: Any website could make requests to your backend and steal user data.

**With CORS**: Only approved origins (like your AR Viewer) can access the API.

---

## 🆘 If CORS Fix Doesn't Work

### **Check these common issues:**

1. **Backend server not restarted** - Restart after adding CORS
2. **Wrong origin** - Make sure it's exactly `http://localhost:5173` (no trailing slash)
3. **OPTIONS not handled** - Add preflight request handler
4. **Headers missing** - Must include `Access-Control-Allow-Origin`
5. **Ngrok issue** - Try adding `ngrok-skip-browser-warning` header

### **Debug with browser DevTools:**

1. Open DevTools (F12)
2. Go to Network tab
3. Click Bank QR face
4. Look for `/create-bank-order` request
5. Check Response Headers
6. Should see: `Access-Control-Allow-Origin: http://localhost:5173`

---

## 📞 Communication

### **AR Viewer Team:**

"Backend CORS blocking connection. Using mock mode until fixed."

### **Backend Team:**

"Need to add CORS headers. See `REVOLUT_CORS_FIX_REQUIRED.md` for solution."

### **When Fixed:**

"✅ CORS configured! AR Viewer can now switch to production mode."

---

## 📚 Resources

- **CORS Docs**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
- **Express CORS**: https://expressjs.com/en/resources/middleware/cors.html
- **CORS Package**: https://www.npmjs.com/package/cors

---

**Status**: ⏳ Waiting for backend CORS fix  
**Blocking**: Real payment testing  
**Workaround**: Mock mode enabled  
**Next Step**: Backend team adds CORS headers
