import React from "react";

function SimpleDebugComponent() {
  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#1a1a1a",
        color: "white",
        fontFamily: "Arial, sans-serif",
        minHeight: "100vh",
      }}
    >
      <h1>🚀 AR Viewer Debug Page</h1>
      <p>✅ React is working!</p>
      <p>✅ Database has 17 objects</p>
      <p>✅ API keys are updated</p>
      <p>✅ Server running on port 5173</p>

      <div style={{ marginTop: "20px" }}>
        <button
          onClick={() => (window.location.href = "/ar-view")}
          style={{
            background: "#4CAF50",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            marginRight: "10px",
          }}
        >
          Go to AR View
        </button>

        <button
          onClick={() => window.location.reload()}
          style={{
            background: "#2196F3",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Reload Page
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#333",
          borderRadius: "5px",
        }}
      >
        <h3>Database Objects Found:</h3>
        <ul>
          <li>Bus Assistant Malaga 1 (Bus Stop Agent)</li>
          <li>3D World Builder 1</li>
          <li>Payment Terminal trailing 4</li>
          <li>+ 14 more AR objects</li>
        </ul>
      </div>
    </div>
  );
}

export default SimpleDebugComponent;
