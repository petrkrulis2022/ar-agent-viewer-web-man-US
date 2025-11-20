/**
 * Agent Interaction Manager
 * Example component showing how to use the agent services together
 * for discovering, communicating with, and paying agents
 */

import React, { useState, useEffect } from "react";
import { discoverAgents } from "../services/agentDiscoveryService";
import { createAgentCommunication } from "../services/agentCommunicationService";
import {
  handlePaymentWithWallet,
  formatPaymentSummary,
  getTransactionExplorerUrl,
} from "../services/hederaPaymentService";

export function AgentInteractionExample() {
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [agentComm, setAgentComm] = useState(null);
  const [messages, setMessages] = useState([]);
  const [journeyPlan, setJourneyPlan] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // Step 1: Discover agents near user's location
  useEffect(() => {
    async function loadNearbyAgents() {
      // Get user's location (in real app, use navigator.geolocation)
      const latitude = 51.5074; // Example: London
      const longitude = -0.1278;

      try {
        const nearbyAgents = await discoverAgents(latitude, longitude, 5000);
        setAgents(nearbyAgents);
      } catch (error) {
        console.error("Failed to discover agents:", error);
      }
    }

    loadNearbyAgents();
  }, []);

  // Step 2: Connect to agent and set up communication
  async function connectToAgent(agent) {
    try {
      setSelectedAgent(agent);

      const comm = createAgentCommunication(agent.serviceUrl);
      await comm.connect();

      // Listen for chat messages
      comm.on("chat_response", (payload) => {
        setMessages((prev) => [
          ...prev,
          {
            from: "agent",
            text: payload.text,
            timestamp: Date.now(),
          },
        ]);
      });

      // Listen for journey plan
      comm.on("final_plan", (payload) => {
        console.log("Received journey plan:", payload);
        setJourneyPlan(payload);
      });

      setAgentComm(comm);

      // Send initial greeting
      comm.sendChatMessage("Hello! I need help planning a journey.");
    } catch (error) {
      console.error("Failed to connect to agent:", error);
    }
  }

  // Step 3: Send a message to the agent
  function sendMessage(text) {
    if (!agentComm) return;

    setMessages((prev) => [
      ...prev,
      {
        from: "user",
        text,
        timestamp: Date.now(),
      },
    ]);

    agentComm.sendChatMessage(text);
  }

  // Step 4: Request journey planning
  function requestJourney(from, to) {
    if (!agentComm) return;

    agentComm.requestJourneyPlan({
      from,
      to,
      departureTime: new Date().toISOString(),
      preferences: ["fastest", "cheapest"],
    });
  }

  // Step 5: Pay for the journey using multi-transfer
  async function payForJourney(walletProvider) {
    if (!journeyPlan || !journeyPlan.costBreakdown) {
      console.error("No journey plan available");
      return;
    }

    try {
      setPaymentStatus({
        status: "processing",
        message: "Please approve in your wallet...",
      });

      // Execute payment
      const result = await handlePaymentWithWallet(
        journeyPlan.costBreakdown,
        walletProvider
      );

      if (result.success) {
        const explorerUrl = getTransactionExplorerUrl(result.transactionId);

        setPaymentStatus({
          status: "success",
          message: "Payment successful!",
          transactionId: result.transactionId,
          explorerUrl,
        });

        // Notify agent of successful payment
        if (agentComm) {
          agentComm.send("payment_confirmed", {
            transactionId: result.transactionId,
          });
        }
      } else {
        setPaymentStatus({
          status: "error",
          message: `Payment failed: ${result.error}`,
        });
      }
    } catch (error) {
      setPaymentStatus({
        status: "error",
        message: `Payment error: ${error.message}`,
      });
    }
  }

  return (
    <div className="agent-interaction-example">
      <h2>Agent Interaction Example</h2>

      {/* Agent Discovery */}
      <section>
        <h3>Nearby Agents</h3>
        <div className="agents-list">
          {agents.map((agent) => (
            <div key={agent.id} className="agent-card">
              <h4>{agent.name}</h4>
              <p>Type: {agent.type}</p>
              <p>Distance: {agent.distance}m</p>
              <button onClick={() => connectToAgent(agent)}>Connect</button>
            </div>
          ))}
        </div>
      </section>

      {/* Agent Communication */}
      {selectedAgent && (
        <section>
          <h3>Chat with {selectedAgent.name}</h3>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.from}`}>
                <strong>{msg.from}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Type a message..."
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  sendMessage(e.target.value);
                  e.target.value = "";
                }
              }}
            />
          </div>
          <button onClick={() => requestJourney("London", "Paris")}>
            Plan Journey to Paris
          </button>
        </section>
      )}

      {/* Journey Plan & Payment */}
      {journeyPlan && (
        <section>
          <h3>Journey Plan</h3>
          <div className="journey-details">
            <h4>Route</h4>
            {journeyPlan.route?.map((leg, idx) => (
              <div key={idx}>
                <p>
                  {leg.from} → {leg.to} ({leg.agent})
                </p>
              </div>
            ))}

            <h4>Payment Breakdown</h4>
            {formatPaymentSummary(journeyPlan.costBreakdown).items.map(
              (item, idx) => (
                <div key={idx}>
                  <p>
                    {item.description}: {item.amount} {item.currency}
                  </p>
                </div>
              )
            )}
            <p>
              <strong>
                Total: {formatPaymentSummary(journeyPlan.costBreakdown).total}{" "}
                USDh
              </strong>
            </p>

            <button onClick={() => payForJourney(window.hashpackWallet)}>
              Pay with HashPack
            </button>
          </div>
        </section>
      )}

      {/* Payment Status */}
      {paymentStatus && (
        <section>
          <div className={`payment-status ${paymentStatus.status}`}>
            <p>{paymentStatus.message}</p>
            {paymentStatus.explorerUrl && (
              <a
                href={paymentStatus.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on HashScan
              </a>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
