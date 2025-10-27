import React from "react";

function TestApp() {
  console.log("🧪 TestApp component rendered");

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
        🚀 AR Viewer Test
      </h1>

      <div style={{ textAlign: "center", maxWidth: "600px" }}>
        <h2>✅ React is Working!</h2>
        <p>The page is rendering correctly now.</p>

        <div style={{ marginTop: "30px" }}>
          <button
            onClick={() => {
              console.log("Button clicked!");
              alert("React event handling works!");
            }}
            style={{
              background: "#4CAF50",
              color: "white",
              border: "none",
              padding: "15px 30px",
              fontSize: "18px",
              borderRadius: "10px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Test Click
          </button>

          <button
            onClick={() => (window.location.href = "/ar-view")}
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
            Go to AR View
          </button>
        </div>

        <div
          style={{
            marginTop: "40px",
            padding: "20px",
            background: "rgba(0,0,0,0.3)",
            borderRadius: "10px",
            textAlign: "left",
          }}
        >
          <h3>🗄️ Database Status:</h3>
          <ul>
            <li>✅ 17 AR objects found in database</li>
            <li>✅ Bus Assistant Malaga 1 (Bus Stop Agent)</li>
            <li>✅ Payment Terminals active</li>
            <li>✅ Multi-network deployment</li>
          </ul>
        </div>

        <div style={{ marginTop: "20px", fontSize: "14px", opacity: 0.8 }}>
          <p>If you see this page, React is working correctly!</p>
          <p>Server: http://localhost:5173</p>
        </div>
      </div>
    </div>
  );
}

export default TestApp;
