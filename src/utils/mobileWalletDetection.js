/**
 * Mobile Wallet Detection Utility
 * Handles wallet connections for both desktop (browser extension) and mobile (deep linking)
 */

/**
 * Check if user is on a mobile device
 */
export const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent,
  );
};

/**
 * Connect to MetaMask on desktop (extension) or mobile (deep link)
 * Returns: { success: boolean, address?: string, balance?: string, error?: string, redirected?: boolean }
 */
export const connectMetaMaskUniversal = async () => {
  const mobile = isMobile();

  // Desktop: Use browser extension
  if (!mobile) {
    if (typeof window.ethereum !== "undefined") {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        if (accounts.length > 0) {
          const address = accounts[0];
          const balance = await getWalletBalance(address);

          return {
            success: true,
            address,
            balance,
          };
        }
      } catch (error) {
        console.error("MetaMask connection error:", error);
        return {
          success: false,
          error: error.message || "Failed to connect to MetaMask",
        };
      }
    } else {
      return {
        success: false,
        error: "MetaMask extension not installed",
      };
    }
  }

  // Mobile: Use deep linking
  // Mark that we're attempting a mobile connection
  sessionStorage.setItem("wallet_connection_pending", "true");
  sessionStorage.setItem("wallet_connection_time", Date.now().toString());

  // Construct deep link
  const currentUrl = window.location.href;
  const deepLink = `https://metamask.app.link/dapp/${window.location.host}${window.location.pathname}${window.location.search}`;

  console.log("Redirecting to MetaMask app via deep link:", deepLink);

  // Redirect to MetaMask app
  window.location.href = deepLink;

  // Return immediately - actual connection will happen when user returns
  return {
    success: false,
    redirected: true,
    error: "Redirecting to MetaMask app...",
  };
};

/**
 * Check if there's a pending mobile wallet connection
 * Call this on page load to auto-reconnect after returning from MetaMask app
 */
export const checkPendingMobileConnection = async () => {
  const pending = sessionStorage.getItem("wallet_connection_pending");
  const connectionTime = sessionStorage.getItem("wallet_connection_time");

  if (!pending || pending !== "true") {
    return null;
  }

  // Check if connection attempt is still recent (within 5 minutes)
  const now = Date.now();
  const attemptTime = parseInt(connectionTime || "0");
  const fiveMinutes = 5 * 60 * 1000;

  if (now - attemptTime > fiveMinutes) {
    // Connection attempt expired
    sessionStorage.removeItem("wallet_connection_pending");
    sessionStorage.removeItem("wallet_connection_time");
    return null;
  }

  // Check if MetaMask is now available (injected by MetaMask app)
  if (typeof window.ethereum !== "undefined") {
    try {
      // Try to get accounts (should work if user approved in MetaMask app)
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        // Success! User connected in MetaMask app
        sessionStorage.removeItem("wallet_connection_pending");
        sessionStorage.removeItem("wallet_connection_time");

        const address = accounts[0];
        const balance = await getWalletBalance(address);

        return {
          success: true,
          address,
          balance,
          method: "mobile",
        };
      }
    } catch (error) {
      console.error("Error checking pending connection:", error);
    }
  }

  // Still pending or failed
  return {
    success: false,
    pending: true,
  };
};

/**
 * Auto-detect wallet connection on page load
 * Checks for both pending mobile connections and existing desktop connections
 */
export const autoDetectWallet = async () => {
  // First check if there's a pending mobile connection
  const mobileConnection = await checkPendingMobileConnection();
  if (mobileConnection) {
    return mobileConnection;
  }

  // Then check for existing desktop connection
  if (typeof window.ethereum !== "undefined") {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0) {
        const address = accounts[0];
        const balance = await getWalletBalance(address);

        return {
          success: true,
          address,
          balance,
          method: "desktop",
        };
      }
    } catch (error) {
      console.error("Error auto-detecting wallet:", error);
    }
  }

  return null;
};

/**
 * Get wallet balance in ETH
 */
export const getWalletBalance = async (address) => {
  try {
    if (typeof window.ethereum !== "undefined") {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });

      // Convert from wei to ETH
      const ethBalance = parseInt(balance, 16) / 1e18;
      return ethBalance.toFixed(4);
    }
  } catch (error) {
    console.error("Error getting wallet balance:", error);
  }
  return "0.0000";
};
