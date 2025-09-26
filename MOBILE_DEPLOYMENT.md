# 📱 AR Agent Viewer - Mobile Deployment Guide

## 🚀 Netlify Deployment Steps

### Method 1: Drag & Drop (Quickest)

1. **Zip the dist folder**: `zip -r ar-viewer-dist.zip dist/`
2. **Go to**: [netlify.com](https://netlify.com)
3. **Drag & drop** the `dist` folder to Netlify
4. **Get your live URL** (e.g., `https://amazing-name-123456.netlify.app`)

### Method 2: Git Integration (Recommended)

1. **Push to GitHub** (if not already done)
2. **Connect to Netlify**:
   - Go to netlify.com → "Add new site" → "Import from Git"
   - Select your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Auto-deploy**: Every push triggers new deployment

## 📱 Mobile Setup

### Create iPhone/Android Shortcut:

1. **Open the Netlify URL** in mobile browser
2. **Add to Home Screen**:
   - **iOS**: Safari → Share → "Add to Home Screen"
   - **Android**: Chrome → Menu → "Add to Home Screen"
3. **Launch like a native app** from home screen!

## ✅ What Works on Mobile:

- ✅ **AR Camera View** - Full camera access and AR rendering
- ✅ **3D Payment Cube** - Touch/swipe interactions
- ✅ **QR Code Scanning** - Native camera QR detection
- ✅ **Agent Deployment** - Deploy agents anywhere in the world
- ✅ **Cross-chain Payments** - All payment methods work
- ✅ **Revolut Integration** - Ready for testing with sandbox Client ID

## 🔧 Current Build:

- **Size**: ~1.4MB compressed
- **Chunks**: Optimized for mobile loading
- **PWA Ready**: Can be installed as app
- **Offline Support**: Basic caching enabled

## 🌍 Deploy Anywhere:

Your AR viewer is now accessible worldwide! Share the Netlify link to let anyone:

- View and interact with your deployed agents
- Make payments via the AR cube interface
- Experience AR agent interactions on mobile

---

**Live URL**: Your Netlify deployment link will appear here after deployment
