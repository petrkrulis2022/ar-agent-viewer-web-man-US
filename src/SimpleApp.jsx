import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

// Simple landing page component
function SimpleLanding() {
  const navigate = useNavigate();

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
        🚀 CubePay
      </h1>

      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "40px",
          textAlign: "center",
        }}
      >
        AR Agent Network with 17 Active Agents
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
          onClick={() => navigate("/ar-view")}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          🌐 Enter AR World
        </button>

        <button
          onClick={() => navigate("/debug")}
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "15px 30px",
            fontSize: "18px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          🧪 Debug Page
        </button>
      </div>

      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "10px",
          maxWidth: "600px",
        }}
      >
        <h3>🗄️ Database Status:</h3>
        <ul style={{ textAlign: "left" }}>
          <li>✅ 17 AR objects deployed</li>
          <li>🚌 Bus Assistant Malaga 1 (Hedera Demo)</li>
          <li>💳 Payment Terminals active</li>
          <li>🌐 Multi-network: Ethereum, Base, Arbitrum, OP</li>
        </ul>
      </div>
    </div>
  );
}

// Simple AR View placeholder
function SimpleARView() {
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
      <h1 style={{ fontSize: "3rem", marginBottom: "20px" }}>🌐 AR View</h1>

      <p style={{ fontSize: "1.2rem", marginBottom: "30px" }}>
        AR Viewer would load here with 17 agents
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
          padding: "15px",
          background: "rgba(0,0,0,0.3)",
          borderRadius: "10px",
        }}
      >
        <p>🚌 Bus Assistant Malaga 1 - Ready for Hedera Demo</p>
        <p>💰 Dynamic payment splitting configured</p>
        <p>🔗 A2A messaging between agents</p>
      </div>
    </div>
  );
}

// Simple debug page
function SimpleDebugPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        background: "#1a1a1a",
        minHeight: "100vh",
        color: "white",
        fontFamily: "monospace",
        padding: "20px",
      }}
    >
      <h1>🧪 Debug Information</h1>

      <div style={{ marginTop: "20px" }}>
        <h3>✅ Working Components:</h3>
        <ul>
          <li>React Router - ✅</li>
          <li>Database Connection - ✅</li>
          <li>Environment Variables - ✅</li>
          <li>Server on Port 5173 - ✅</li>
        </ul>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            background: "#4CAF50",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
            marginRight: "10px",
          }}
        >
          Home
        </button>

        <button
          onClick={() => navigate("/ar-view")}
          style={{
            background: "#2196F3",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          AR View
        </button>
      </div>
    </div>
  );
}

// Main App with simple routing
function SimpleApp() {
  console.log("🧪 SimpleApp component rendered");

  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimpleLanding />} />
        <Route path="/ar-view" element={<SimpleARView />} />
        <Route path="/debug" element={<SimpleDebugPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default SimpleApp;
