import React, { useState, useEffect } from "react";
import LoadingStage from "./LoadingStage";
import FlightDataDisplay from "./FlightDataDisplay";
import PackageComparison from "./PackageComparison";
import PaymentPreview from "./PaymentPreview";
import ConfirmationScreen from "./ConfirmationScreen";
import UnlockPayment from "./UnlockPayment";
import ChatInterface from "./ChatInterface";
import {
  queryTravelAgent,
  mockTravelQuery,
} from "../../services/travelAgentAPI";

const TravelAgentFlow = ({ agent, onClose, connectedWallet }) => {
  const [stage, setStage] = useState("unlock"); // unlock, chat, loading, flight-data, comparison, payment, confirmation
  const [loadingStage, setLoadingStage] = useState("mcp-query"); // mcp-query, a2a-coordination, package-assembly, complete
  const [loadingOperation, setLoadingOperation] = useState(
    "Querying Flightradar24 via x402..."
  );
  const [costSoFar, setCostSoFar] = useState("0.00000");

  // API Response Data
  const [queryResponse, setQueryResponse] = useState(null);
  const [flightDataReal, setFlightDataReal] = useState(null);
  const [packageDataReal, setPackageDataReal] = useState(null);

  // Handle unlock payment completion
  const handleUnlockComplete = () => {
    console.log("✅ Unlock payment complete - Chat unlocked");
    setStage("chat");
  };

  // Handle user sending query in chat
  const handleUserQuery = async (query) => {
    console.log("📤 User query:", query);
    setStage("loading");
    setLoadingStage("mcp-query");
    setLoadingOperation("Querying Flightradar24 via x402...");
    setCostSoFar("0.00000");

    try {
      // Call real Travel Agent API (or mock if offline)
      const USE_MOCK = import.meta.env.VITE_USE_MOCK_TRAVEL === "true";

      let response;
      if (USE_MOCK) {
        console.log("🧪 Using mock Travel Agent response");
        response = await mockTravelQuery();
      } else {
        console.log("🌐 Calling real Travel Agent API");
        response = await queryTravelAgent({
          agentAccountId: agent.hedera_account_id || "0.0.7301930",
          query,
          origin: "BUD",
          destination: "BCN",
          date: new Date().toISOString().split("T")[0],
        });
      }

      if (!response.success) {
        console.error("❌ Travel query failed:", response.error);
        alert(`Query failed: ${response.error}`);
        setStage("chat");
        return;
      }

      setQueryResponse(response);

      // Process flight data
      if (response.flightData && response.flightData.flights) {
        const cheapestFlight = response.flightData.flights[0];
        setFlightDataReal({
          departureCode: cheapestFlight.departure.airport,
          departureCity: "Budapest",
          departureTime: cheapestFlight.departure.time,
          arrivalCode: cheapestFlight.arrival.airport,
          arrivalCity: "Barcelona",
          arrivalTime: cheapestFlight.arrival.time,
          duration: cheapestFlight.duration,
          airline: cheapestFlight.airline,
          flightNumber: cheapestFlight.flightNumber,
          date: new Date().toLocaleDateString(),
          price: cheapestFlight.price.economy,
        });
      }

      // Process package data
      if (response.alternativePackage) {
        setPackageDataReal({
          totalPrice: response.alternativePackage.total,
          hotelName: "Hotel Room 512",
          savings: 150,
          bus: response.alternativePackage.bus,
          train: response.alternativePackage.train,
          hotel: response.alternativePackage.hotel,
          agentFee: response.alternativePackage.travelAgentFee,
        });
      }

      // Start loading sequence
      setTimeout(() => {
        setCostSoFar(response.mcpCost.toString());
        setLoadingStage("a2a-coordination");
        setLoadingOperation("Coordinating with Bus, Train & Hotel Agents...");
      }, 2500);

      setTimeout(() => {
        setCostSoFar("0.00035");
        setLoadingStage("package-assembly");
        setLoadingOperation("Assembling final travel package...");
      }, 5000);

      setTimeout(() => {
        setLoadingStage("complete");
        setStage("flight-data");
      }, 7500);
    } catch (error) {
      console.error("❌ Query error:", error);
      alert(`Error: ${error.message}`);
      setStage("chat");
    }
  };

  // Use real or fallback flight data
  const flightData = flightDataReal || {
    departureCode: "BUD",
    departureCity: "Budapest",
    departureTime: "16:05",
    arrivalCode: "BCN",
    arrivalCity: "Barcelona",
    arrivalTime: "18:30",
    duration: "2h 25m",
    airline: "Ryanair",
    flightNumber: "FR8024",
    date: new Date().toLocaleDateString(),
    price: 45,
  };

  const packageData = packageDataReal || {
    totalPrice: 4325,
    hotelName: "Hotel Room 512",
    savings: 150,
    bus: { fee: 1000, details: "Bus to train station" },
    train: { fee: 1500, details: "Train to Barcelona" },
    hotel: { fee: 1200, details: "Hotel (2 nights)" },
    agentFee: 625,
  };

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
      {stage === "unlock" && (
        <UnlockPayment
          agent={agent}
          onUnlockComplete={handleUnlockComplete}
          onClose={onClose}
          connectedWallet={connectedWallet}
        />
      )}

      {stage === "chat" && (
        <ChatInterface
          agent={agent}
          onSendQuery={handleUserQuery}
          onClose={onClose}
        />
      )}

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
          agent={agent}
          connectedWallet={connectedWallet}
        />
      )}

      {stage === "confirmation" && <ConfirmationScreen onReset={handleReset} />}
    </>
  );
};

export default TravelAgentFlow;
