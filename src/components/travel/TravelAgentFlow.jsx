import React, { useState, useEffect } from "react";
import LoadingStage from "./LoadingStage";
import FlightDataDisplay from "./FlightDataDisplay";
import PackageComparison from "./PackageComparison";
import PaymentPreview from "./PaymentPreview";
import ConfirmationScreen from "./ConfirmationScreen";

const TravelAgentFlow = ({ agent, onClose }) => {
  const [stage, setStage] = useState("loading"); // loading, flight-data, comparison, payment, confirmation
  const [loadingStage, setLoadingStage] = useState("mcp-query"); // mcp-query, a2a-coordination, package-assembly, complete
  const [loadingOperation, setLoadingOperation] = useState(
    "Querying Flightradar24 via x402..."
  );
  const [costSoFar, setCostSoFar] = useState("0.00000");

  // Mock Data
  const flightData = {
    departureCode: "SFO",
    departureCity: "San Francisco",
    departureTime: "08:45 AM",
    arrivalCode: "LHR",
    arrivalCity: "London",
    arrivalTime: "02:15 PM",
    duration: "10h 30m",
    airline: "British Airways",
    flightNumber: "BA 286",
    date: "Oct 24, 2024",
    price: 850,
  };

  const packageData = {
    totalPrice: 945, // Flight (850) + Bus (25) + Hotel (70)
    hotelName: "Hilton London Heathrow",
    savings: 150,
  };

  // Simulate Loading Sequence
  useEffect(() => {
    if (stage === "loading") {
      // Step 1: MCP Query
      setTimeout(() => {
        setCostSoFar("0.00022");
        setLoadingStage("a2a-coordination");
        setLoadingOperation("Coordinating with Bus & Hotel Agents...");
      }, 2500);

      // Step 2: A2A Coordination
      setTimeout(() => {
        setCostSoFar("0.00035");
        setLoadingStage("package-assembly");
        setLoadingOperation("Assembling final travel package...");
      }, 5000);

      // Step 3: Package Assembly -> Complete
      setTimeout(() => {
        setLoadingStage("complete");
        setStage("flight-data");
      }, 7500);
    }
  }, [stage]);

  const handleFlightSelect = () => {
    setStage("comparison");
  };

  const handlePackageSelect = () => {
    setStage("payment");
  };

  const handlePaymentConfirm = () => {
    // Simulate payment processing
    setTimeout(() => {
      setStage("confirmation");
    }, 1500);
  };

  const handleReset = () => {
    onClose();
  };

  return (
    <>
      {stage === "loading" && (
        <LoadingStage
          stage={loadingStage}
          currentOperation={loadingOperation}
          costSoFar={costSoFar}
        />
      )}

      {stage === "flight-data" && (
        <FlightDataDisplay
          flightData={flightData}
          onSelect={handleFlightSelect}
          onCancel={onClose}
        />
      )}

      {stage === "comparison" && (
        <PackageComparison
          flightData={flightData}
          packageData={packageData}
          onSelectPackage={handlePackageSelect}
        />
      )}

      {stage === "payment" && (
        <PaymentPreview
          packageData={packageData}
          onConfirm={handlePaymentConfirm}
          onCancel={() => setStage("comparison")}
        />
      )}

      {stage === "confirmation" && <ConfirmationScreen onReset={handleReset} />}
    </>
  );
};

export default TravelAgentFlow;
