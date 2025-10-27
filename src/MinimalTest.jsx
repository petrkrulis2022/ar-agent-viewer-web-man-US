import React from "react";

export default function MinimalTest() {
  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "linear-gradient(to bottom right, #1a1a2e, #16213e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#00ff66",
        fontFamily: "monospace",
        fontSize: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "48px", marginBottom: "20px" }}>
          ✅ React is Working!
        </h1>
        <p>AR Viewer is rendering correctly</p>
        <p style={{ marginTop: "20px" }}>
          <a href="/diagnostic.html" style={{ color: "#00ff66" }}>
            Go to Diagnostic
          </a>
        </p>
      </div>
    </div>
  );
}
