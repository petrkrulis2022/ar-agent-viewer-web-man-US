import React, { useState, useEffect } from "react";
import { networkDetectionService } from "../services/networkDetectionService";
import { hederaWalletService } from "../services/hederaWalletService";

const NetworkDisplay = ({ className = "" }) => {
  const [currentNetwork, setCurrentNetwork] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hbarBalance, setHbarBalance] = useState(null);
  const [walletAddress, setWalletAddress] = useState(null);

  useEffect(() => {
    // Initial network detection
    detectNetwork();

    // Start network listener and store cleanup function
    const stopNetworkListener = networkDetectionService.startNetworkListener();

    // Listen for network changes
    const handleNetworkChange = (event) => {
      setCurrentNetwork(event.detail.network);
      setIsLoading(false);
    };

    // Listen for wallet connection changes
    const handleWalletChange = () => {
      detectNetwork();
    };

    document.addEventListener("networkChanged", handleNetworkChange);

    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleWalletChange);
    }

    return () => {
      document.removeEventListener("networkChanged", handleNetworkChange);
      // Call the cleanup function returned by startNetworkListener
      stopNetworkListener();

      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", handleWalletChange);
      }
    };
  }, []);

  const detectNetwork = async () => {
    setIsLoading(true);

    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        setIsWalletConnected(accounts.length > 0);

        if (accounts.length > 0) {
          const network = await networkDetectionService.detectCurrentNetwork();
          setCurrentNetwork(network);
          setWalletAddress(accounts[0]);

          // Fetch HBAR balance if connected to Hedera Testnet (Chain ID 296)
          if (network && network.chainId === 296) {
            try {
              const balance = await hederaWalletService.getHBARBalance(
                accounts[0]
              );
              setHbarBalance(balance);
              console.log("💰 HBAR Balance fetched:", balance);
            } catch (balanceError) {
              console.error("Failed to fetch HBAR balance:", balanceError);
              setHbarBalance(null);
            }
          } else {
            setHbarBalance(null);
          }
        } else {
          setCurrentNetwork(null);
          setHbarBalance(null);
          setWalletAddress(null);
        }
      } catch (error) {
        console.error("❌ Failed to detect network:", error);
        setCurrentNetwork(null);
        setIsWalletConnected(false);
        setHbarBalance(null);
        setWalletAddress(null);
      }
    } else {
      setCurrentNetwork(null);
      setIsWalletConnected(false);
      setHbarBalance(null);
      setWalletAddress(null);
    }

    setIsLoading(false);
  };

  if (!isWalletConnected || !currentNetwork || isLoading) {
    return null;
  }

  const isSupported = currentNetwork.isSupported !== false;
  const isHederaTestnet = currentNetwork.chainId === 296;

  return (
    <div className={`network-display ${className}`}>
      <div
        className={`network-indicator ${
          isSupported ? "supported" : "unsupported"
        }`}
        style={{
          backgroundColor: isSupported
            ? `${currentNetwork.color}20`
            : "rgba(255, 165, 0, 0.1)",
          borderColor: isSupported ? currentNetwork.color : "#ffa500",
          color: isSupported ? currentNetwork.color : "#ffa500",
        }}
      >
        <span
          className="network-dot"
          style={{
            backgroundColor: isSupported ? currentNetwork.color : "#ffa500",
          }}
        ></span>
        <span className="network-name">
          {currentNetwork.shortName || currentNetwork.name}
        </span>
        {isHederaTestnet && hbarBalance !== null && (
          <span className="balance-display" title="HBAR Balance">
            {hbarBalance.toFixed(4)} HBAR
          </span>
        )}
        {!isSupported && (
          <span className="unsupported-warning" title="Unsupported Network">
            ⚠️
          </span>
        )}
      </div>

      <style>{`
        .network-display {
          margin-top: 4px;
          font-size: 12px;
          font-family: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .network-indicator {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          border: 1px solid;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .network-indicator.supported:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .network-indicator.unsupported {
          animation: pulse 2s infinite;
        }

        .network-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .network-name {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.025em;
        }

        .balance-display {
          font-size: 10px;
          font-weight: 700;
          margin-left: 4px;
          padding: 2px 6px;
          background-color: rgba(255, 255, 255, 0.15);
          border-radius: 8px;
          letter-spacing: 0.02em;
        }

        .unsupported-warning {
          font-size: 10px;
          margin-left: 2px;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
};

export default NetworkDisplay;
