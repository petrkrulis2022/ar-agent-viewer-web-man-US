# CubePay Monorepo Setup Instructions

## Step-by-Step Setup for cube-pay-hacks Repository

### 1. Navigate to the CubePay Repository

```bash
cd ~/cube-pay-hacks
```

### 2. Create Root Configuration Files

#### package.json (Root)

```json
{
  "name": "cubepay-monorepo",
  "version": "1.0.0",
  "private": true,
  "description": "CubePay - AR Agent Deployment & Viewing Platform with Multi-Chain Payments",
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "clean": "turbo run clean && rm -rf node_modules",
    "format": "prettier --write \"**/*.{ts,tsx,md,json}\"",
    "dev:deployment": "turbo run dev --filter=deployment-app",
    "dev:ar-viewer": "turbo run dev --filter=ar-viewer-app",
    "dev:api": "turbo run dev --filter=api-server"
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "prettier": "^3.2.4",
    "turbo": "^1.12.0",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@10.2.4"
}
```

#### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "clean": {
      "cache": false
    }
  }
}
```

#### .gitignore

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
build/
dist/
.next/
out/

# Misc
.DS_Store
*.pem
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Turbo
.turbo

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
Thumbs.db
```
