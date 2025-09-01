// Cube Payment Handler - Orchestrates 3D Cube payments with crypto QR integration
// Manages cube face clicks and displays QR codes directly in AR space

import React, { useEffect, useState, useRef } from "react";
import evmPaymentService from "../services/evmPaymentService";
import solanaPaymentService from "../services/solanaPaymentService";
import qrCodeService from "../services/qrCodeService";
import QRCode from "react-qr-code";

const CubePaymentHandler = ({
  agent,
  amount = 1,
  userLocation,
  onPaymentComplete,
}) => {
  const [activePayment, setActivePayment] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("idle");
  const [selectedChain, setSelectedChain] = useState(null);
  const qrDisplayRef = useRef(null);

  useEffect(() => {
    // Listen for cube face clicks
    const handleCryptoQRSelected = async (event) => {
      console.log("🎯 Crypto QR face clicked");
      await handleCryptoQRPayment();
    };

    const handleSolanaSelected = async (event) => {
      console.log("🟠 Solana face clicked");
      await handleSolanaPayment();
    };

    const handleClosePayment = () => {
      console.log("❌ Closing payment");
      closePaymentDisplay();
    };

    // Register event listeners
    document.addEventListener("crypto-qr-selected", handleCryptoQRSelected);
    document.addEventListener("solana-selected", handleSolanaSelected);
    document.addEventListener("close-payment", handleClosePayment);

    return () => {
      document.removeEventListener(
        "crypto-qr-selected",
        handleCryptoQRSelected
      );
      document.removeEventListener("solana-selected", handleSolanaSelected);
      document.removeEventListener("close-payment", handleClosePayment);
    };
  }, [agent, amount]);

  // Handle EVM Crypto QR Payment
  const handleCryptoQRPayment = async () => {
    try {
      setPaymentStatus("generating");

      console.log("🔧 Initializing EVM payment service...");
      const chain = await evmPaymentService.initialize();
      setSelectedChain(chain);

      console.log("💳 Generating EVM payment data...");
      const paymentData = await evmPaymentService.generateEVMAgentPayment(
        agent,
        amount
      );
      setActivePayment(paymentData);

      console.log("📱 Generating QR code...");
      const qrResult = await generateQRCode(paymentData.qrData.eip681, "EVM");
      setQrData(qrResult);

      console.log("🌟 Displaying QR in AR space...");
      displayQRInAR(qrResult, paymentData, chain);

      setPaymentStatus("waiting");
    } catch (error) {
      console.error("❌ Crypto QR payment error:", error);
      setPaymentStatus("error");
      showErrorInAR(error.message);
    }
  };

  // Handle Solana Payment
  const handleSolanaPayment = async () => {
    try {
      setPaymentStatus("generating");

      console.log("🟠 Generating Solana payment...");
      solanaPaymentService.switchSolanaNetwork("TESTNET");
      const solanaPayment = solanaPaymentService.generateSolanaAgentPayment(
        agent,
        amount,
        "SOL"
      );
      setActivePayment(solanaPayment);

      const qrResult = await generateQRCode(solanaPayment.qrData, "Solana");
      setQrData(qrResult);

      displayQRInAR(qrResult, solanaPayment, {
        name: "Solana Testnet",
        color: "#9945FF",
      });
      setPaymentStatus("waiting");
    } catch (error) {
      console.error("❌ Solana payment error:", error);
      setPaymentStatus("error");
      showErrorInAR(error.message);
    }
  };

  // Generate QR code with enhanced data
  const generateQRCode = async (qrDataString, network) => {
    try {
      const qrCodeDataUrl = await qrCodeService.generateQRCode(qrDataString);

      return {
        dataUrl: qrCodeDataUrl,
        rawData: qrDataString,
        network: network,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("❌ QR generation failed:", error);
      throw error;
    }
  };

  // Display QR code directly in AR space
  const displayQRInAR = (qrResult, paymentData, chain) => {
    try {
      // Remove any existing payment display
      closePaymentDisplay();

      const scene = document.querySelector("a-scene");
      if (!scene) {
        console.error("❌ A-Frame scene not found");
        return;
      }

      // Create QR container
      const qrContainer = document.createElement("a-entity");
      qrContainer.setAttribute("id", "payment-qr-display");
      qrContainer.setAttribute("position", "0 2 -4");

      // QR Code Background Panel
      const qrBackground = document.createElement("a-plane");
      qrBackground.setAttribute("position", "0 0 0");
      qrBackground.setAttribute("width", "3.5");
      qrBackground.setAttribute("height", "4");
      qrBackground.setAttribute("material", "color: #000000; opacity: 0.9");
      qrBackground.setAttribute("geometry", "primitive: plane");
      qrContainer.appendChild(qrBackground);

      // QR Code Image
      const qrPlane = document.createElement("a-plane");
      qrPlane.setAttribute("position", "0 0.5 0.01");
      qrPlane.setAttribute("width", "2.5");
      qrPlane.setAttribute("height", "2.5");
      qrPlane.setAttribute(
        "material",
        `src: ${qrResult.dataUrl}; transparent: true`
      );
      qrContainer.appendChild(qrPlane);

      // Payment Title
      const titleText = document.createElement("a-text");
      titleText.setAttribute("position", "0 1.5 0.01");
      titleText.setAttribute("text", {
        value: `💳 ${chain.name} Payment`,
        align: "center",
        color: chain.color || "#00ff00",
        width: 8,
        font: "roboto",
      });
      qrContainer.appendChild(titleText);

      // Amount and Token
      const amountText = document.createElement("a-text");
      const tokenSymbol = paymentData.payment
        ? paymentData.payment.token
        : "USDC";
      amountText.setAttribute("position", "0 -1 0.01");
      amountText.setAttribute("text", {
        value: `${amount} ${tokenSymbol}`,
        align: "center",
        color: "#ffffff",
        width: 12,
        font: "roboto",
      });
      qrContainer.appendChild(amountText);

      // Instructions
      const instructionText = document.createElement("a-text");
      instructionText.setAttribute("position", "0 -1.5 0.01");
      instructionText.setAttribute("text", {
        value: "Scan with crypto wallet",
        align: "center",
        color: "#cccccc",
        width: 6,
        font: "roboto",
      });
      qrContainer.appendChild(instructionText);

      // Close Button
      const closeButton = document.createElement("a-plane");
      closeButton.setAttribute("position", "1.5 1.5 0.01");
      closeButton.setAttribute("width", "0.4");
      closeButton.setAttribute("height", "0.4");
      closeButton.setAttribute("material", "color: #ff4444; opacity: 0.8");
      closeButton.setAttribute("text", {
        value: "✕",
        align: "center",
        color: "#ffffff",
        width: 20,
      });
      closeButton.setAttribute("class", "clickable");
      closeButton.addEventListener("click", () => {
        document.dispatchEvent(new CustomEvent("close-payment"));
      });
      qrContainer.appendChild(closeButton);

      // Add to scene
      scene.appendChild(qrContainer);
      qrDisplayRef.current = qrContainer;

      console.log("✅ QR code displayed in AR space");

      // Auto-hide after 5 minutes
      setTimeout(() => {
        if (qrDisplayRef.current) {
          closePaymentDisplay();
        }
      }, 300000);
    } catch (error) {
      console.error("❌ Failed to display QR in AR:", error);
    }
  };

  // Show error message in AR space
  const showErrorInAR = (errorMessage) => {
    try {
      const scene = document.querySelector("a-scene");
      if (!scene) return;

      closePaymentDisplay();

      const errorContainer = document.createElement("a-entity");
      errorContainer.setAttribute("id", "payment-error-display");
      errorContainer.setAttribute("position", "0 2 -3");

      const errorBackground = document.createElement("a-plane");
      errorBackground.setAttribute("width", "4");
      errorBackground.setAttribute("height", "2");
      errorBackground.setAttribute("material", "color: #440000; opacity: 0.9");
      errorContainer.appendChild(errorBackground);

      const errorText = document.createElement("a-text");
      errorText.setAttribute("position", "0 0.2 0.01");
      errorText.setAttribute("text", {
        value: "❌ Payment Error",
        align: "center",
        color: "#ff4444",
        width: 8,
      });
      errorContainer.appendChild(errorText);

      const errorDetails = document.createElement("a-text");
      errorDetails.setAttribute("position", "0 -0.3 0.01");
      errorDetails.setAttribute("text", {
        value: errorMessage.substring(0, 50) + "...",
        align: "center",
        color: "#ffcccc",
        width: 6,
      });
      errorContainer.appendChild(errorDetails);

      scene.appendChild(errorContainer);
      qrDisplayRef.current = errorContainer;

      // Auto-hide error after 10 seconds
      setTimeout(() => {
        if (qrDisplayRef.current === errorContainer) {
          closePaymentDisplay();
        }
      }, 10000);
    } catch (error) {
      console.error("❌ Failed to show error in AR:", error);
    }
  };

  // Close payment display
  const closePaymentDisplay = () => {
    if (qrDisplayRef.current) {
      const scene = document.querySelector("a-scene");
      if (scene && qrDisplayRef.current.parentNode === scene) {
        scene.removeChild(qrDisplayRef.current);
      }
      qrDisplayRef.current = null;
    }

    setActivePayment(null);
    setQrData(null);
    setPaymentStatus("idle");
    setSelectedChain(null);
  };

  // This component manages events, no direct render
  return null;
};

export default CubePaymentHandler;
