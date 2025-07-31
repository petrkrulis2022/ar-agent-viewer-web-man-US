import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Import AR QR Manager for global access
import arQRManager from "./services/arQRManager";
import qrCodeService from "./services/qrCodeService";

// Make AR QR services globally available for testing and debugging
window.arQRManager = arQRManager;
window.qrCodeService = qrCodeService;

// Development testing utilities
if (import.meta.env.DEV) {
  import("./utils/testARQRFix.js")
    .then((module) => {
      window.testARQRFix = module.runAllTests;
      console.log(
        "🧪 AR QR Fix Testing available: Run testARQRFix() in console"
      );
    })
    .catch((err) => {
      console.log("Legacy testing utilities not available");
    });

  // Load comprehensive test suite
  import("./utils/comprehensiveARQRTest.js")
    .then((module) => {
      window.runARQRTests = module.runAllARQRTests;
      window.testARQRGeneration = module.testARQRGeneration;
      window.testPaymentProcessing = module.testPaymentProcessing;
      console.log(
        "🧪 Comprehensive AR QR Testing available:\n" +
          "   - runARQRTests(): Complete test suite\n" +
          "   - testARQRGeneration(): Test QR generation\n" +
          "   - testPaymentProcessing(): Test payment pipeline"
      );
    })
    .catch((err) => {
      console.log(
        "Comprehensive testing utilities not available in production"
      );
    });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
