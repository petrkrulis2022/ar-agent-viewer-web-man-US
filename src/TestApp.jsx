import React from "react";

function TestApp() {
  console.log("TestApp rendering...");

  return (
    <div
      style={{
        background: "black",
        color: "white",
        padding: "20px",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>🎯 AR Viewer Test Page</h1>
      <p>If you can see this, React is working!</p>
      <div
        style={{
          background: "green",
          padding: "10px",
          borderRadius: "5px",
          margin: "10px 0",
        }}
      >
        ✅ React component rendering successfully
      </div>
      <button
        onClick={() => {
          console.log("Button clicked!");
          alert("Button clicked!");
        }}
        style={{
          background: "blue",
          color: "white",
          padding: "10px 20px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Test Button
      </button>
    </div>
  );
}

export default TestApp;
