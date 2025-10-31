// src/components/VirtualCardManager.jsx
import React, { useState, useEffect } from "react";
import { RevolutPaymentModal } from "./RevolutPaymentModal/RevolutPaymentModal";
import { RevolutLoginFlow } from "./RevolutLoginFlow/RevolutLoginFlow";
import { createVirtualCard, topUpCard } from "../services/revolutCardService";

/**
 * Virtual Card Manager Component
 * Manages Revolut Virtual Cards for AR Agent payments
 *
 * Features:
 * - View existing virtual cards
 * - Create new virtual cards
 * - Top up cards with funds
 * - Use cards for payments
 */
export function VirtualCardManager({
  isOpen = false,
  agentId,
  agentName = "AgentSphere Agent",
  paymentAmount = 10.0, // 💰 Dynamic payment amount from e-shop/on-ramp or agent fee
  onClose,
  onPaymentComplete,
}) {
  console.log("🎴 VirtualCardManager render - isOpen:", isOpen);

  // Don't render if not open
  if (!isOpen) {
    console.log("🎴 VirtualCardManager NOT OPEN - returning null");
    return null;
  }

  console.log("🎴 VirtualCardManager IS OPEN - rendering modal");

  // Card colors for visual variety (same number, different gradients)
  const CARD_COLORS = [
    { from: "#0075EB", to: "#00D4FF", name: "Ocean Blue" },
    { from: "#7C3AED", to: "#A78BFA", name: "Purple Haze" },
    { from: "#EC4899", to: "#F472B6", name: "Pink Sunset" },
    { from: "#F59E0B", to: "#FBBF24", name: "Golden Hour" },
    { from: "#10B981", to: "#34D399", name: "Emerald Green" },
  ];

  const [view, setView] = useState("selector"); // selector, create, topup, payment
  const [existingCards, setExistingCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [newCard, setNewCard] = useState(null);
  const [topUpAmount, setTopUpAmount] = useState("25");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showLoginFlow, setShowLoginFlow] = useState(false);
  const [showRevolutModal, setShowRevolutModal] = useState(false);

  // Load existing cards from localStorage
  useEffect(() => {
    const storedCards = localStorage.getItem("revolutVirtualCards");
    if (storedCards) {
      try {
        const cards = JSON.parse(storedCards);
        setExistingCards(cards);
      } catch (err) {
        console.error("Failed to load cards:", err);
      }
    }
  }, []);

  // Save cards to localStorage
  const saveCardsToStorage = (cards) => {
    localStorage.setItem("revolutVirtualCards", JSON.stringify(cards));
  };

  // Handle card selection
  const handleSelectCard = (card) => {
    setSelectedCard(card);
    console.log("💳 Card selected:", card);
  };

  // Handle "Pay with this card" button
  const handlePayWithSelectedCard = () => {
    console.log("💳 Initiating payment with selected card");
    console.log("💰 Payment amount:", {
      amount: paymentAmount,
      currency: "USD",
      source: "Dynamic from e-shop/on-ramp or agent fee",
    });
    // Show login flow first, then payment modal
    setShowLoginFlow(true);
  };

  // Handle "Create New Card" button
  const handleCreateNewCard = async () => {
    try {
      setLoading(true);
      setError(null);
      setView("create");

      console.log("✨ Creating new virtual card...");

      // Generate random color for this card
      const randomColor =
        CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];

      const result = await createVirtualCard(
        agentId,
        100, // $1.00 initial balance
        "USD",
        `Agent_${agentId}_Card_${Date.now()}`
      );

      console.log("✅ Card created:", result);

      const cardWithColor = {
        ...result.card,
        gradient: randomColor,
      };

      setNewCard(cardWithColor);
      setView("topup");
    } catch (err) {
      console.error("❌ Card creation failed:", err);
      setError(err.message);
      setView("selector");
    } finally {
      setLoading(false);
    }
  };

  // Handle top-up
  const handleTopUp = async () => {
    if (!newCard || !topUpAmount) return;

    try {
      setLoading(true);
      setError(null);

      const amount = Math.round(parseFloat(topUpAmount) * 100);
      console.log("💰 Topping up card:", amount);

      const result = await topUpCard(newCard.card_id, amount, "USD");
      console.log("✅ Card topped up:", result);

      // Update card balance
      const updatedCard = {
        ...newCard,
        balance: result.topup.new_balance || newCard.balance + amount,
      };

      // Save to existing cards
      const updatedCards = [...existingCards, updatedCard];
      setExistingCards(updatedCards);
      saveCardsToStorage(updatedCards);

      setNewCard(updatedCard);
      setView("payment");
    } catch (err) {
      console.error("❌ Top up failed:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle "Pay with this Virtual Card" after top-up
  const handlePayWithNewCard = () => {
    console.log("💳 Initiating payment with new card");
    console.log("💰 Payment amount:", {
      amount: paymentAmount,
      currency: "USD",
      source: "Dynamic from e-shop/on-ramp or agent fee",
    });
    // Show login flow first, then payment modal
    setShowLoginFlow(true);
  };

  // Handle login flow completion
  const handleLoginComplete = () => {
    console.log("✅ Login flow completed, showing payment modal");
    setShowLoginFlow(false);
    setShowRevolutModal(true);
  };

  // Handle payment confirmation
  const handlePaymentConfirm = async () => {
    console.log(
      "✅ Payment confirmed, closing all modals and returning to AR viewer"
    );
    setShowRevolutModal(false);

    // Close all modals and return to AR viewer (without agent modal open)
    setTimeout(() => {
      onPaymentComplete?.({
        success: true,
        amount: paymentAmount, // 💰 Use dynamic payment amount
        currency: "USD",
        card: selectedCard || newCard,
        closeAgentModal: true, // Signal to close the agent modal and show all agents
      });
    }, 500);
  };

  // Handle payment cancellation
  const handlePaymentCancel = () => {
    setShowRevolutModal(false);
  };

  // Render card selector view
  const renderCardSelector = () => (
    <div className="card-selector-view">
      <h2 className="virtual-card-title">Select Payment Card</h2>

      {existingCards.length > 0 && (
        <div className="existing-cards-container">
          <h3 className="section-subtitle">Your Cards</h3>
          <div className="cards-carousel">
            {existingCards.map((card, index) => (
              <div
                key={card.card_id}
                className={`card-item ${
                  selectedCard?.card_id === card.card_id ? "selected" : ""
                }`}
                onClick={() => handleSelectCard(card)}
                style={{
                  background: `linear-gradient(135deg, ${card.gradient.from} 0%, ${card.gradient.to} 100%)`,
                }}
              >
                <div className="card-chip"></div>
                <div className="card-number">
                  •••• •••• •••• {card.card_number.slice(-4)}
                </div>
                <div className="card-balance">
                  ${(card.balance / 100).toFixed(2)}
                </div>
                {selectedCard?.card_id === card.card_id && (
                  <div className="selected-badge">✓ Selected</div>
                )}
              </div>
            ))}
          </div>

          {selectedCard && (
            <button
              onClick={handlePayWithSelectedCard}
              className="btn btn-primary btn-large"
            >
              💳 Pay with this Virtual Card
            </button>
          )}
        </div>
      )}

      <div className="create-card-section">
        <button
          onClick={handleCreateNewCard}
          disabled={loading}
          className="btn btn-secondary btn-large"
        >
          {loading ? "Creating..." : "✨ Create New Virtual Card"}
        </button>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}
    </div>
  );

  // Render card top-up view
  const renderTopUp = () => (
    <div className="topup-view">
      <h2 className="virtual-card-title">Top Up Your New Card</h2>

      {newCard && (
        <div
          className="card-display"
          style={{
            background: `linear-gradient(135deg, ${newCard.gradient.from} 0%, ${newCard.gradient.to} 100%)`,
          }}
        >
          <div className="card-chip"></div>
          <div className="card-number">
            •••• •••• •••• {newCard.card_number.slice(-4)}
          </div>
          <div className="card-balance">
            ${(newCard.balance / 100).toFixed(2)}
          </div>
        </div>
      )}

      <div className="topup-section">
        <h3 className="section-subtitle">Add Funds</h3>
        <div className="input-group">
          <input
            type="number"
            placeholder="Amount (USD)"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(e.target.value)}
            disabled={loading}
            className="input-field"
            step="0.01"
            min="0"
          />
          <button
            onClick={handleTopUp}
            disabled={loading || !topUpAmount || parseFloat(topUpAmount) <= 0}
            className="btn btn-primary"
          >
            {loading ? "⏳ Processing..." : "💰 Add Funds"}
          </button>
        </div>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}
    </div>
  );

  // Render payment ready view
  const renderPaymentReady = () => (
    <div className="payment-ready-view">
      <h2 className="virtual-card-title">Card Ready for Payment</h2>

      {newCard && (
        <div
          className="card-display"
          style={{
            background: `linear-gradient(135deg, ${newCard.gradient.from} 0%, ${newCard.gradient.to} 100%)`,
          }}
        >
          <div className="card-chip"></div>
          <div className="card-number">
            •••• •••• •••• {newCard.card_number.slice(-4)}
          </div>
          <div className="card-balance">
            ${(newCard.balance / 100).toFixed(2)}
          </div>
        </div>
      )}

      <button
        onClick={handlePayWithNewCard}
        className="btn btn-primary btn-large"
      >
        💳 Pay with this Virtual Card
      </button>
    </div>
  );

  return (
    <>
      <style>
        {`
          .virtual-card-title {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
            text-align: center;
            background: linear-gradient(135deg, #0075EB 0%, #00D4FF 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
          }

          .section-subtitle {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
            color: #374151;
          }

          .cards-carousel {
            display: flex;
            gap: 15px;
            overflow-x: auto;
            padding: 10px;
            margin-bottom: 20px;
          }

          .card-item {
            min-width: 280px;
            height: 180px;
            border-radius: 16px;
            padding: 20px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            box-shadow: 0 8px 20px rgba(0, 117, 235, 0.3);
          }

          .card-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 30px rgba(0, 117, 235, 0.4);
          }

          .card-item.selected {
            border: 3px solid #10B981;
            transform: scale(1.05);
          }

          .card-chip {
            width: 45px;
            height: 35px;
            background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
            border-radius: 6px;
            margin-bottom: 25px;
          }

          .card-number {
            font-size: 20px;
            font-family: 'Courier New', monospace;
            letter-spacing: 2px;
            margin-bottom: 20px;
          }

          .card-balance {
            font-size: 24px;
            font-weight: bold;
          }

          .selected-badge {
            position: absolute;
            top: 15px;
            right: 15px;
            background: #10B981;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }

          .card-display {
            width: 100%;
            max-width: 350px;
            height: 220px;
            border-radius: 20px;
            padding: 25px;
            color: white;
            margin: 20px auto;
            box-shadow: 0 15px 35px rgba(0, 117, 235, 0.4);
          }

          .btn {
            padding: 12px 24px;
            border-radius: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            font-size: 16px;
          }

          .btn-primary {
            background: linear-gradient(135deg, #0075EB 0%, #00D4FF 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 117, 235, 0.4);
          }

          .btn-secondary {
            background: linear-gradient(135deg, rgba(107, 114, 128, 0.9) 0%, rgba(75, 85, 99, 0.9) 100%);
            color: white;
          }

          .btn-large {
            width: 100%;
            max-width: 400px;
            margin: 20px auto;
            display: block;
            padding: 16px 32px;
            font-size: 18px;
          }

          .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          .input-group {
            display: flex;
            gap: 10px;
            margin: 20px 0;
          }

          .input-field {
            flex: 1;
            padding: 12px;
            border: 2px solid #E5E7EB;
            border-radius: 8px;
            font-size: 16px;
          }

          .input-field:focus {
            outline: none;
            border-color: #0075EB;
          }

          .error-message {
            padding: 12px;
            background: #FEE2E2;
            color: #DC2626;
            border-radius: 8px;
            margin: 15px 0;
            text-align: center;
          }

          .create-card-section {
            margin-top: 30px;
            padding-top: 30px;
            border-top: 2px solid #E5E7EB;
          }

          .topup-section,
          .payment-ready-view {
            max-width: 400px;
            margin: 0 auto;
          }
          
          .virtual-card-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.75);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            padding: 20px;
          }
          
          .virtual-card-modal-content {
            background: white;
            border-radius: 20px;
            padding: 30px;
            max-width: 600px;
            width: 100%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
          }
          
          .virtual-card-close-button {
            position: absolute;
            top: 15px;
            right: 15px;
            background: rgba(0, 0, 0, 0.1);
            border: none;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            z-index: 10001;
          }
          
          .virtual-card-close-button:hover {
            background: rgba(0, 0, 0, 0.2);
            transform: scale(1.1);
          }
        `}
      </style>

      <div
        className="virtual-card-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose?.();
          }
        }}
      >
        <div className="virtual-card-modal-content">
          <button
            className="virtual-card-close-button"
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="virtual-card-manager">
            {view === "selector" && renderCardSelector()}
            {view === "topup" && renderTopUp()}
            {view === "payment" && renderPaymentReady()}
          </div>
        </div>
      </div>

      {/* Revolut Login Flow */}
      {showLoginFlow && (
        <RevolutLoginFlow
          onLoginComplete={handleLoginComplete}
          userEmail="p***@proton.me"
          userName="Peter Krulis"
        />
      )}

      {/* Revolut Desktop Payment Modal */}
      {showRevolutModal && (
        <RevolutPaymentModal
          type="desktop"
          merchantName={agentName}
          amount={paymentAmount} // 💰 Dynamic payment amount from e-shop/on-ramp
          currency="USD"
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </>
  );
}

export default VirtualCardManager;
