import express from 'express';
import cors from 'cors';
import crypto from 'crypto';

/**
 * Backend API for Coinbase Onramp Session Token Generation
 * 
 * IMPORTANT: This requires CDP API credentials
 * Get your credentials from: https://portal.cdp.coinbase.com/
 * 
 * Environment Variables Required:
 * - CDP_API_KEY_NAME: Your CDP API key name
 * - CDP_API_PRIVATE_KEY: Your CDP private key
 */

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Generate JWT for CDP authentication
function generateJWT(apiKeyName, privateKey) {
  const header = {
    alg: 'ES256',
    kid: apiKeyName,
    typ: 'JWT'
  };

  const payload = {
    iss: 'coinbase-cloud',
    sub: apiKeyName,
    aud: ['cdp-service'],
    nbf: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 120, // 2 minutes
    uris: ['https://api.developer.coinbase.com/onramp/v1/token']
  };

  // Base64URL encoding
  const base64UrlEncode = (obj) => {
    return Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  };

  const encodedHeader = base64UrlEncode(header);
  const encodedPayload = base64UrlEncode(payload);
  const message = `${encodedHeader}.${encodedPayload}`;

  // Sign with private key (ES256)
  const sign = crypto.createSign('SHA256');
  sign.update(message);
  sign.end();
  
  const signature = sign.sign(privateKey, 'base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  return `${message}.${signature}`;
}

// Generate session token endpoint
app.post('/api/onramp/session-token', async (req, res) => {
  try {
    const { addresses, assets, amount } = req.body;

    // Validate input
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid addresses parameter' 
      });
    }

    // Get CDP credentials from environment
    const apiKeyName = process.env.CDP_API_KEY_NAME;
    const privateKey = process.env.CDP_API_PRIVATE_KEY;

    if (!apiKeyName || !privateKey) {
      console.error('❌ CDP credentials not configured');
      console.error('Set CDP_API_KEY_NAME and CDP_API_PRIVATE_KEY environment variables');
      
      // For development/testing, return mock token
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Development mode: Returning mock session token');
        return res.json({
          token: 'sandbox_mock_' + Math.random().toString(36).substring(7),
          isMock: true
        });
      }

      return res.status(500).json({ 
        error: 'CDP credentials not configured' 
      });
    }

    // Generate JWT
    const jwt = generateJWT(apiKeyName, privateKey);

    // Call Coinbase API to get session token
    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwt}`
      },
      body: JSON.stringify({
        addresses: addresses.map(addr => ({
          address: addr.address,
          blockchains: addr.blockchains || ['base']
        })),
        assets: assets || ['USDC'],
        clientIp: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Coinbase API error:', errorData);
      return res.status(response.status).json({ 
        error: 'Failed to generate session token',
        details: errorData
      });
    }

    const data = await response.json();
    
    console.log('✅ Session token generated successfully');
    
    res.json({
      token: data.token,
      expiresAt: data.expiresAt
    });

  } catch (error) {
    console.error('Error generating session token:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasCredentials: !!(process.env.CDP_API_KEY_NAME && process.env.CDP_API_PRIVATE_KEY)
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Onramp API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📍 Session token: POST http://localhost:${PORT}/api/onramp/session-token`);
  
  if (!process.env.CDP_API_KEY_NAME || !process.env.CDP_API_PRIVATE_KEY) {
    console.log('');
    console.log('⚠️  WARNING: CDP credentials not configured');
    console.log('Set the following environment variables:');
    console.log('  - CDP_API_KEY_NAME');
    console.log('  - CDP_API_PRIVATE_KEY');
    console.log('');
    console.log('Get your credentials from: https://portal.cdp.coinbase.com/');
    
    if (process.env.NODE_ENV === 'development') {
      console.log('');
      console.log('🧪 Running in development mode - will return mock tokens');
    }
  } else {
    console.log('');
    console.log('✅ CDP credentials configured');
  }
});

export default app;
