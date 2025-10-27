# 🔐 Netlify Environment Variables Setup Guide

## 📋 **REQUIRED ENVIRONMENT VARIABLES**

Based on your AR Viewer codebase, you need to configure these environment variables in Netlify:

### **🗄️ SUPABASE DATABASE VARIABLES**

```bash
VITE_SUPABASE_URL=https://ncjbwzibnqrbrvicdmec.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **🏦 REVOLUT INTEGRATION VARIABLES**

```bash
VITE_REVOLUT_CLIENT_ID_SANDBOX=96ca6a20-254d-46e7-aad1-46132e087901
VITE_REVOLUT_CLIENT_ID_PRODUCTION=PRODUCTION_CLIENT_ID_TO_BE_OBTAINED
NODE_ENV=production
```

### **⚡ OPTIONAL PERFORMANCE VARIABLES**

```bash
VITE_APP_TITLE=AgentSphere AR Viewer
VITE_BUILD_VERSION=1.0.0-revolut-qr-payments
VITE_ENABLE_DEBUG=false
```

---

## 🚀 **NETLIFY CONFIGURATION STEPS**

### **Method 1: Via Netlify Dashboard** (Easiest)

1. **Go to your site settings** in Netlify
2. **Navigate to**: Site settings → Environment variables
3. **Add each variable**:
   - Key: `VITE_SUPABASE_URL`
   - Value: `https://ncjbwzibnqrbrvicdmec.supabase.co`
   - Scope: `All deploy contexts` ✅
4. **Repeat for all variables** listed above

### **Method 2: Via netlify.toml** (Automated)

Add to your `netlify.toml` file:

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"
  VITE_SUPABASE_URL = "https://ncjbwzibnqrbrvicdmec.supabase.co"
  VITE_REVOLUT_CLIENT_ID_SANDBOX = "96ca6a20-254d-46e7-aad1-46132e087901"
  NODE_ENV = "production"

# Note: Sensitive keys like ANON_KEY should be set via dashboard for security

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 🔒 **SECURITY BEST PRACTICES**

### **✅ SAFE TO EXPOSE** (Include in netlify.toml)

- `VITE_SUPABASE_URL` - Public URL, safe to expose
- `VITE_REVOLUT_CLIENT_ID_SANDBOX` - Client ID, meant to be public
- `NODE_ENV` - Build environment flag
- `VITE_APP_TITLE` - Public app information

### **⚠️ SENSITIVE** (Set via Dashboard Only)

- `VITE_SUPABASE_ANON_KEY` - Database access key
- `VITE_SUPABASE_SERVICE_ROLE_KEY` - Admin access key
- `VITE_REVOLUT_CLIENT_ID_PRODUCTION` - Production credentials

---

## 📱 **MOBILE-SPECIFIC VARIABLES**

For optimal mobile performance:

```bash
# PWA Support
VITE_PWA_NAME="AR Agent Viewer"
VITE_PWA_SHORT_NAME="ARViewer"
VITE_PWA_DESCRIPTION="Deploy and interact with AR agents worldwide"

# Mobile Optimization
VITE_MOBILE_VIEWPORT_SCALE="1.0"
VITE_ENABLE_CAMERA_PERMISSIONS="true"
VITE_AR_CAMERA_RESOLUTION="720p"
```

---

## 🔧 **DEPLOYMENT CONTEXTS**

Configure different variables for different environments:

### **Production Context**

```bash
NODE_ENV=production
VITE_REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901  # Production ID when ready
VITE_ENABLE_DEBUG=false
```

### **Deploy Previews** (Branch deployments)

```bash
NODE_ENV=staging
VITE_REVOLUT_CLIENT_ID=96ca6a20-254d-46e7-aad1-46132e087901  # Sandbox for testing
VITE_ENABLE_DEBUG=true
```

---

## ✅ **VERIFICATION CHECKLIST**

After setting up environment variables:

- [ ] **Supabase Connection**: Agent data loads correctly
- [ ] **AR Camera Access**: Camera permissions work on mobile
- [ ] **Payment Cube**: All payment methods render properly
- [ ] **QR Code Generation**: QR codes generate and scan correctly
- [ ] **Cross-chain Payments**: CCIP and blockchain integration works
- [ ] **Mobile Responsiveness**: Touch interactions work smoothly
- [ ] **Revolut Sandbox**: Client ID loads for future integration

---

## 🚨 **TROUBLESHOOTING**

### **Common Issues:**

**Build Fails with "VITE_SUPABASE_URL is not defined"**

- Solution: Ensure all `VITE_*` variables are set in Netlify dashboard

**AR Camera Not Working on Mobile**

- Check: `VITE_ENABLE_CAMERA_PERMISSIONS=true`
- Ensure: HTTPS deployment (Netlify provides this automatically)

**Payment Methods Not Loading**

- Verify: All Supabase variables are correctly set
- Check: Database is accessible from production environment

**Revolut Integration Not Working**

- Confirm: `VITE_REVOLUT_CLIENT_ID_SANDBOX` is set correctly
- Verify: Sandbox Client ID: `96ca6a20-254d-46e7-aad1-46132e087901`

---

## 🎯 **QUICK SETUP COMMANDS**

If you have Netlify CLI installed:

```bash
# Set key variables via CLI
netlify env:set VITE_SUPABASE_URL "https://ncjbwzibnqrbrvicdmec.supabase.co"
netlify env:set VITE_REVOLUT_CLIENT_ID_SANDBOX "96ca6a20-254d-46e7-aad1-46132e087901"
netlify env:set NODE_ENV "production"

# Deploy with environment
netlify deploy --prod --dir=dist
```

---

## 📋 **COMPLETE VARIABLE LIST**

Copy-paste ready for Netlify dashboard:

```
Key: VITE_SUPABASE_URL
Value: https://ncjbwzibnqrbrvicdmec.supabase.co

Key: VITE_SUPABASE_ANON_KEY
Value: [Your actual Supabase anon key from documentation]

Key: VITE_REVOLUT_CLIENT_ID_SANDBOX
Value: 96ca6a20-254d-46e7-aad1-46132e087901

Key: NODE_ENV
Value: production

Key: VITE_APP_TITLE
Value: AgentSphere AR Viewer

Key: VITE_BUILD_VERSION
Value: 1.0.0-revolut-qr-payments
```

---

**🎉 Your AR viewer will be fully functional on mobile with these environment variables configured!**

**Next Step**: After setting these up, your Netlify deployment will have:

- ✅ Full database connectivity
- ✅ AR camera access on mobile
- ✅ Payment cube functionality
- ✅ Revolut integration ready for development
- ✅ Global agent deployment capability
