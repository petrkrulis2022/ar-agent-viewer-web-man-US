// src/components/RevolutLoginFlow/RevolutLoginFlow.jsx
import React, { useState, useEffect } from "react";
import "./RevolutLoginFlow.css";

/**
 * Revolut Login Flow Component
 *
 * Simulates the complete Revolut login experience before payment:
 * 1. Continue As (user selection)
 * 2. Enter Password
 * 3. Check Your Email
 * 4. Email Confirmed
 * 5. Revolut Logo (loading)
 * 6. Finally shows payment confirmation modal
 */
export function RevolutLoginFlow({
  onLoginComplete,
  userEmail = "p***@proton.me",
  userName = "Peter Krulis",
}) {
  const [step, setStep] = useState("continue-as"); // continue-as, password, email-check, email-confirmed, logo-loading
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [countdown, setCountdown] = useState(20);

  // Email countdown timer
  useEffect(() => {
    if (step === "email-check" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  // Auto-progress through steps
  const handleContinueAs = () => {
    console.log("👤 User selected:", userName);
    setStep("password");
  };

  const handlePasswordContinue = () => {
    console.log("🔐 Password entered");
    setStep("email-check");
  };

  const handleEmailOpen = () => {
    console.log("📧 Email opened");
    setStep("email-confirmed");

    // Auto-progress after 2 seconds
    setTimeout(() => {
      setStep("logo-loading");

      // Show logo for 1 second then complete
      setTimeout(() => {
        onLoginComplete();
      }, 1000);
    }, 2000);
  };

  // Render Continue As screen
  if (step === "continue-as") {
    return (
      <div className="revolut-login-overlay">
        <div className="revolut-login-modal continue-as-modal">
          <h2 className="login-title">Continue as</h2>

          <button className="user-select-button" onClick={handleContinueAs}>
            <div className="user-avatar">
              <img
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 48 48'%3E%3Ccircle cx='24' cy='24' r='24' fill='%230075EB'/%3E%3Ctext x='24' y='32' text-anchor='middle' fill='white' font-size='20' font-family='Arial' font-weight='bold'%3EPK%3C/text%3E%3C/svg%3E"
                alt="User avatar"
              />
            </div>
            <div className="user-info">
              <div className="user-name">{userName}</div>
              <div className="user-email">{userEmail}</div>
            </div>
            <div className="arrow-icon">›</div>
          </button>

          <button className="not-you-button">Not you?</button>
        </div>
      </div>
    );
  }

  // Render Password Entry screen
  if (step === "password") {
    return (
      <div className="revolut-login-overlay">
        <div className="revolut-login-modal password-modal">
          <button
            className="back-button"
            onClick={() => setStep("continue-as")}
          >
            ←
          </button>

          <h2 className="login-title">Enter password</h2>

          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
              placeholder="Password"
              autoFocus
            />
            <button
              className="show-password-button"
              onClick={() => setShowPassword(!showPassword)}
            >
              👁
            </button>
          </div>

          <button className="forgot-password-link">
            Forgot your password?
          </button>

          <button
            className="continue-button"
            onClick={handlePasswordContinue}
            disabled={password.length < 4}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // Render Email Check screen
  if (step === "email-check") {
    return (
      <div className="revolut-login-overlay">
        <div className="revolut-login-modal email-check-modal">
          <button className="close-button" onClick={() => setStep("password")}>
            ✕
          </button>

          <button className="open-email-button" onClick={handleEmailOpen}>
            Open
          </button>

          <h2 className="email-title">Check your email on this device</h2>

          <p className="email-message">
            We've sent a verification email to {userEmail}. Open it on this
            device and click the button to continue
          </p>

          <button className="choose-another-method">
            Choose another method
          </button>

          <div className="email-illustration">
            <svg width="200" height="200" viewBox="0 0 200 200">
              <rect
                x="20"
                y="60"
                width="160"
                height="120"
                rx="8"
                fill="#E8F4FF"
                stroke="#0075EB"
                strokeWidth="2"
              />
              <rect
                x="40"
                y="40"
                width="160"
                height="120"
                rx="8"
                fill="#F0F8FF"
                stroke="#0075EB"
                strokeWidth="2"
              />
              <rect
                x="60"
                y="20"
                width="160"
                height="120"
                rx="8"
                fill="white"
                stroke="#0075EB"
                strokeWidth="3"
              />
              <line
                x1="80"
                y1="50"
                x2="200"
                y2="120"
                stroke="#0075EB"
                strokeWidth="2"
              />
              <line
                x1="200"
                y1="50"
                x2="80"
                y2="120"
                stroke="#0075EB"
                strokeWidth="2"
              />
              <circle cx="140" cy="100" r="20" fill="#0075EB" opacity="0.2" />
              <path
                d="M130 100 L137 107 L150 93"
                fill="none"
                stroke="#0075EB"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="resend-email">
            Resend email in{" "}
            {String(Math.floor(countdown / 60)).padStart(2, "0")}:
            {String(countdown % 60).padStart(2, "0")}
          </div>
        </div>
      </div>
    );
  }

  // Render Email Confirmed screen
  if (step === "email-confirmed") {
    return (
      <div className="revolut-login-overlay">
        <div className="revolut-login-modal email-confirmed-modal">
          <button className="choose-another-method-top">
            Choose another method
          </button>

          <div className="confirmation-content">
            <div className="check-icon">✓</div>
            <h2 className="confirmed-title">Email confirmed</h2>
            <p className="confirmed-message">
              You can now close this tab and continue in the new one
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Revolut Logo Loading screen
  if (step === "logo-loading") {
    return (
      <div className="revolut-login-overlay logo-overlay">
        <div className="revolut-logo-container">
          <div className="revolut-shield-logo">
            <svg width="120" height="140" viewBox="0 0 120 140">
              {/* Shield outline */}
              <path
                d="M 60 10 L 10 40 L 10 80 Q 10 110 60 130 Q 110 110 110 80 L 110 40 Z"
                fill="white"
                stroke="none"
              />

              {/* Inner shield with gradient */}
              <defs>
                <linearGradient
                  id="shieldGradient"
                  x1="0%"
                  y1="0%"
                  x2="0%"
                  y2="100%"
                >
                  <stop
                    offset="0%"
                    style={{ stopColor: "#00D4FF", stopOpacity: 1 }}
                  />
                  <stop
                    offset="100%"
                    style={{ stopColor: "#0075EB", stopOpacity: 1 }}
                  />
                </linearGradient>
              </defs>

              <path
                d="M 60 15 L 15 42 L 15 78 Q 15 105 60 125 Q 105 105 105 78 L 105 42 Z"
                fill="url(#shieldGradient)"
              />

              {/* R letter */}
              <text
                x="60"
                y="90"
                fill="white"
                fontSize="60"
                fontWeight="bold"
                fontFamily="Inter, -apple-system, sans-serif"
                textAnchor="middle"
              >
                R
              </text>
            </svg>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
