/**
 * Z-Index Configuration for ARTM Virtual Terminal Modals
 *
 * Ensures proper layering of AR components and modal overlays.
 * Camera feed remains visible behind all modals at base layer.
 */

export const Z_INDEX = {
  // Base layer - camera feed
  CAMERA_FEED: 0,

  // AR scene with 3D agents
  AR_SCENE: 10,

  // Cube payment modal
  CUBE_PAYMENT: 20,

  // Standard agent interaction modal
  AGENT_INTERACTION: 30,

  // ARTM main display (TAP ON CARD / TAP ON WALLET)
  ARTM_DISPLAY: 40,

  // ARTM withdrawal flow modals (Card/Crypto)
  ARTM_FLOW_MODAL: 50,

  // Success/error notifications (highest)
  NOTIFICATION: 60,
};

export default Z_INDEX;
