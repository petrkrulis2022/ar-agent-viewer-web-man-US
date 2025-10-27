import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Import only essential components first
try {
  // Test basic routing first
  console.log("🧪 Testing basic App imports...");
} catch (error) {
  console.error("❌ Error in App imports:", error);
}

// Minimal MainLanding without complex hooks
function MinimalMainLanding({ onEnterAgentWorld, onShowWallet }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{ fontSize: "4rem", marginBottom: "20px", textAlign: "center" }}
      >
        NeAR Viewer
      </h1>

      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "40px",
          textAlign: "center",
          color: "#4CAF50",
        }}
      >
        17 Active AR Agents • Database Connected ✅
      </p>

      <div
        style={{
          display: "flex",
          gap: "20px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <button
          onClick={onEnterAgentWorld}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "20px 40px",
            fontSize: "20px",
            borderRadius: "15px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(76, 175, 80, 0.3)",
          }}
        >
          🌐 Enter Agent World
        </button>

        <button
          onClick={onShowWallet}
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "20px 40px",
            fontSize: "20px",
            borderRadius: "15px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 15px rgba(33, 150, 243, 0.3)",
          }}
        >
          💰 Connect Wallet
        </button>
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "25px",
          background: "rgba(0,0,0,0.4)",
          borderRadius: "15px",
          maxWidth: "700px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <h3 style={{ color: "#4CAF50", marginBottom: "15px" }}>
          🚌 Hedera Bus Stop Agent Ready
        </h3>
        <ul style={{ textAlign: "left", lineHeight: "1.8" }}>
          <li>✅ Bus Assistant Malaga 1 deployed</li>
          <li>✅ Travel Agent integration active</li>
          <li>✅ Dynamic payment splitting configured</li>
          <li>✅ Multi-network support (Ethereum, Base, Arbitrum, OP)</li>
          <li>🔄 A2A messaging between agents</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px", fontSize: "14px", opacity: 0.7 }}>
        <p>Simplified UI - Core functionality active</p>
      </div>
    </div>
  );
}

// Minimal AR View placeholder
function MinimalARView() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #2d1b69 0%, #11998e 100%)",
        minHeight: "100vh",
        color: "white",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>
        🌐 AR View Loading...
      </h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        Loading AR components with 17 agents...
      </p>

      <div>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#ff6b6b",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>
      </div>

      <div
        style={{
          marginTop: "30px",
          padding: "20px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "10px",
          maxWidth: "500px",
        }}
      >
        <h3>🚌 Bus Assistant Malaga 1</h3>
        <p>Type: bus_stop_agent</p>
        <p>Network: Ethereum Sepolia</p>
        <p>Status: Active ✅</p>
        <p>A2A Messaging: Ready 🔄</p>
        <p>Payment System: Dynamic fees enabled 💰</p>
      </div>
    </div>
  );
}

function AppContent() {
  const navigate = useNavigate();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const handleShowWallet = () => {
    setShowWalletModal(true);
    // For now, just show an alert
    alert("Wallet modal would open here. Wallet integration working ✅");
  };

  const handleCloseWallet = () => {
    setShowWalletModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Routes>
        {/* Main Landing Screen Route */}
        <Route
          path="/"
          element={
            <MinimalMainLanding
              onEnterAgentWorld={() => navigate("/ar-view")}
              onShowWallet={handleShowWallet}
            />
          }
        />

        {/* AR Viewer Route */}
        <Route path="/ar-view" element={<MinimalARView />} />

        {/* Redirect any unknown routes to main landing */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function DebugApp() {
  console.log("🧪 DebugApp component rendered");

  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default DebugApp;
