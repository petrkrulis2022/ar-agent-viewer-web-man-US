import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { generateJwt } from "@coinbase/cdp-sdk/auth";

// Load environment variables from .env.onramp
dotenv.config({ path: "../../.env.onramp" });

/**
 * Backend API for Coinbase Onramp Session Token Generation
 *
 * IMPORTANT: This requires CDP API credentials
 * Get your credentials from: https://portal.cdp.coinbase.com/
 *
 * Environment Variables Required:
 * - CDP_PROJECT_ID: Your CDP project ID
 * - CDP_API_KEY: Your CDP API key
 * - CDP_API_SECRET: Your CDP API secret (base64-encoded private key)
 */

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

/**
 * Generate JWT for CDP API authentication using the official CDP SDK
 * @param {string} apiKey - The CDP API key
 * @param {string} apiSecret - The CDP API secret (base64-encoded)
 * @returns {Promise<string>} JWT token
 */
async function generateJWT(apiKey, apiSecret) {
  const requestMethod = "POST";
  const requestHost = "api.developer.coinbase.com";
  const requestPath = "/onramp/v1/token";

  try {
    // Process the private key to ensure it has proper newlines
    let processedKey = apiSecret;
    if (apiSecret.includes("\\n")) {
      processedKey = apiSecret.replace(/\\n/g, "\n");
    }

    // Use the CDP SDK to generate the JWT
    const token = await generateJwt({
      apiKeyId: apiKey,
      apiKeySecret: processedKey,
      requestMethod: requestMethod,
      requestHost: requestHost,
      requestPath: requestPath,
      expiresIn: 120, // 2 minutes
    });

    return token;
  } catch (error) {
    console.error("❌ Error generating JWT:", error);
    throw error;
  }
}

// Generate session token endpoint
app.post("/api/onramp/session-token", async (req, res) => {
  try {
    const { addresses, assets, amount } = req.body;

    // Validate input
    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({
        error: "Invalid addresses parameter",
      });
    }

    // Get CDP credentials from environment
    const apiKey = process.env.CDP_API_KEY;
    const apiSecret = process.env.CDP_API_SECRET;

    if (!apiKey || !apiSecret) {
      console.error("❌ CDP credentials not configured");
      console.error("Set CDP_API_KEY and CDP_API_SECRET environment variables");

      // For development/testing, return mock token
      if (process.env.NODE_ENV === "development") {
        console.log("⚠️  Development mode: Returning mock session token");
        return res.json({
          token: "sandbox_mock_" + Math.random().toString(36).substring(7),
          isMock: true,
        });
      }

      return res.status(500).json({
        error: "CDP credentials not configured",
      });
    }

    // Generate JWT using CDP SDK
    const jwt = await generateJWT(apiKey, apiSecret);

    // Extract client IP (CDP API requires this)
    let clientIp =
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      req.ip ||
      "127.0.0.1";

    // Handle private IP addresses - use a public test IP for development
    // CDP API requires a real public IP address (no 127.0.0.1, 10.x, 192.168.x, etc.)
    if (
      clientIp === "127.0.0.1" ||
      clientIp === "::1" ||
      clientIp.startsWith("10.") ||
      clientIp.startsWith("192.168.") ||
      clientIp.startsWith("172.") ||
      clientIp.includes("::ffff:127") ||
      clientIp.includes("::1")
    ) {
      // Use Cloudflare's public DNS IP as a valid test IP
      // This is a well-known public IP that CDP API will accept
      clientIp = "1.1.1.1";
      console.log("ℹ️  Using public test IP for development:", clientIp);
    }

    // Call Coinbase API to get session token
    const response = await fetch(
      "https://api.developer.coinbase.com/onramp/v1/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({
          addresses: addresses.map((addr) => ({
            address: addr.address,
            blockchains: addr.blockchains || ["base"],
          })),
          assets: assets || ["USDC"],
          clientIp: clientIp,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ Coinbase API error:", errorData);
      return res.status(response.status).json({
        error: "Failed to generate session token",
        details: errorData,
      });
    }

    const data = await response.json();

    console.log("✅ Session token generated successfully");

    res.json({
      token: data.token,
      expiresAt: data.expiresAt,
    });
  } catch (error) {
    console.error("❌ Error generating session token:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    hasCredentials: !!(process.env.CDP_API_KEY && process.env.CDP_API_SECRET),
    projectId: process.env.CDP_PROJECT_ID || "not configured",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Onramp API server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(
    `📍 Session token: POST http://localhost:${PORT}/api/onramp/session-token`
  );

  if (!process.env.CDP_API_KEY || !process.env.CDP_API_SECRET) {
    console.log("");
    console.log("⚠️  WARNING: CDP credentials not configured");
    console.log("Set the following environment variables in .env.onramp:");
    console.log("  - CDP_PROJECT_ID");
    console.log("  - CDP_API_KEY");
    console.log("  - CDP_API_SECRET");
    console.log("");
    console.log("Get your credentials from: https://portal.cdp.coinbase.com/");

    if (process.env.NODE_ENV === "development") {
      console.log("");
      console.log("🧪 Running in development mode - will return mock tokens");
    }
  } else {
    console.log("");
    console.log("✅ CDP credentials configured");
    console.log(`✅ Project ID: ${process.env.CDP_PROJECT_ID}`);
  }
});

export default app;
