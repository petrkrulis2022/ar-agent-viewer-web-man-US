/**
 * Z-Index Configuration for AR Viewer Modals
 * Centralized z-index management to prevent modal collision bugs
 */

export const Z_INDEX = {
  // Base layers
  CAMERA_VIEW: 0,
  AR_3D_SCENE: 10,

  // Payment systems
  CUBE_PAYMENT_ENGINE: 20,
  AGENT_INTERACTION_MODAL: 30,

  // ARTM Virtual Terminal modals
  ARTM_DISPLAY_MODAL: 40,
  ARTM_DARK_OVERLAY: 40, // Same as modal (overlay + content)

  // ARTM withdrawal modals (card and crypto)
  CARD_WITHDRAWAL_MODAL: 50,
  CRYPTO_WITHDRAWAL_MODAL: 50,
  WITHDRAWAL_OVERLAY: 50, // Overlay for withdrawal modals

  // UI notifications and overlays
  NOTIFICATION_TOAST: 100,
  DEBUG_OVERLAY: 110,
};

export default Z_INDEX;
