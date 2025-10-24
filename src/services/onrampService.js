/**
 * Onramp Service - Handles Coinbase Onramp API interactions
 */

const ONRAMP_API_URL = import.meta.env.VITE_ONRAMP_API_URL || 'http://localhost:3001';

/**
 * Generate a session token for Coinbase Onramp
 * @param {Object} params - Session parameters
 * @param {Array} params.addresses - Array of wallet addresses with blockchains
 * @param {Array} params.assets - Array of asset symbols (e.g., ['USDC'])
 * @param {number} params.amount - Amount to purchase
 * @returns {Promise<Object>} Session token data
 */
export async function generateSessionToken({ addresses, assets = ['USDC'], amount }) {
  try {
    console.log('🔑 Generating Coinbase session token...');
    console.log('📍 Addresses:', addresses);
    console.log('💰 Assets:', assets);
    console.log('💵 Amount:', amount);

    const response = await fetch(`${ONRAMP_API_URL}/api/onramp/session-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses,
        assets,
        amount
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate session token');
    }

    const data = await response.json();
    console.log('✅ Session token generated:', data.isMock ? '(mock)' : '(real)');
    
    return data;
  } catch (error) {
    console.error('❌ Error generating session token:', error);
    throw error;
  }
}

/**
 * Build Coinbase Onramp URL
 * @param {Object} params - URL parameters
 * @param {string} params.sessionToken - Session token
 * @param {string} params.asset - Asset symbol (e.g., 'USDC')
 * @param {number} params.amount - Fiat amount
 * @param {string} params.network - Network name (e.g., 'base')
 * @param {boolean} params.testnet - Use sandbox environment
 * @returns {string} Coinbase Onramp URL
 */
export function buildOnrampUrl({ 
  sessionToken, 
  asset = 'USDC', 
  amount, 
  network = 'base',
  testnet = true 
}) {
  const baseUrl = testnet 
    ? 'https://pay-sandbox.coinbase.com/buy'
    : 'https://pay.coinbase.com/buy';

  const params = new URLSearchParams({
    sessionToken,
    defaultNetwork: network,
    defaultAsset: asset,
    presetFiatAmount: amount.toString(),
    fiatCurrency: 'USD'
  });

  const url = `${baseUrl}?${params.toString()}`;
  console.log('🔗 Onramp URL:', url);
  
  return url;
}

/**
 * Check if onramp API server is running
 * @returns {Promise<boolean>}
 */
export async function checkOnrampAPIHealth() {
  try {
    const response = await fetch(`${ONRAMP_API_URL}/health`);
    const data = await response.json();
    
    console.log('🏥 Onramp API health:', data);
    return data.status === 'ok';
  } catch (error) {
    console.error('❌ Onramp API not available:', error.message);
    return false;
  }
}

/**
 * Simulate transaction confirmation (for testing)
 * In production, this would use webhooks or blockchain monitoring
 * @param {string} txId - Transaction ID
 * @returns {Promise<Object>} Transaction details
 */
export async function confirmOnrampTransaction(txId) {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  return {
    id: txId,
    status: 'success',
    confirmedAt: new Date().toISOString(),
    network: 'base-sepolia',
    txHash: '0x' + Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('')
  };
}

/**
 * Open Coinbase Onramp in popup window
 * @param {string} url - Onramp URL
 * @returns {Window} Popup window reference
 */
export function openOnrampPopup(url) {
  const width = 500;
  const height = 700;
  const left = window.screen.width / 2 - width / 2;
  const top = window.screen.height / 2 - height / 2;
  
  const popup = window.open(
    url,
    'coinbase-onramp',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    throw new Error('Popup blocked. Please allow popups for this site.');
  }

  return popup;
}

/**
 * Monitor popup window and detect when closed
 * @param {Window} popup - Popup window reference
 * @returns {Promise<void>} Resolves when popup is closed
 */
export function waitForPopupClose(popup) {
  return new Promise((resolve) => {
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed);
        resolve();
      }
    }, 500);
  });
}

/**
 * Complete onramp flow
 * @param {Object} params - Flow parameters
 * @returns {Promise<Object>} Transaction result
 */
export async function completeOnrampFlow({ 
  walletAddress, 
  amount, 
  asset = 'USDC',
  network = 'base',
  testnet = true 
}) {
  try {
    // Step 1: Generate session token
    const sessionData = await generateSessionToken({
      addresses: [{
        address: walletAddress,
        blockchains: [network]
      }],
      assets: [asset],
      amount
    });

    // Step 2: Build onramp URL
    const onrampUrl = buildOnrampUrl({
      sessionToken: sessionData.token,
      asset,
      amount,
      network,
      testnet
    });

    // Step 3: Open popup
    const popup = openOnrampPopup(onrampUrl);

    // Step 4: Wait for user to complete purchase
    await waitForPopupClose(popup);

    // Step 5: Confirm transaction
    const txId = 'onramp_' + Date.now();
    const confirmation = await confirmOnrampTransaction(txId);

    return {
      success: true,
      transaction: confirmation
    };
  } catch (error) {
    console.error('❌ Onramp flow failed:', error);
    throw error;
  }
}

export default {
  generateSessionToken,
  buildOnrampUrl,
  checkOnrampAPIHealth,
  confirmOnrampTransaction,
  openOnrampPopup,
  waitForPopupClose,
  completeOnrampFlow
};
