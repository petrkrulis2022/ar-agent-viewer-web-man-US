/**
 * Agent Communication Service
 * Handles WebSocket communication with deployed agents
 * Supports chat, voice, and video interactions
 */

export class AgentCommunicationService {
  constructor(agentServiceUrl) {
    this.agentServiceUrl = agentServiceUrl;
    this.socket = null;
    this.messageHandlers = new Map();
    this.isConnected = false;
  }

  /**
   * Connect to the agent's WebSocket service
   */
  connect() {
    return new Promise((resolve, reject) => {
      try {
        // Convert HTTP(S) URL to WS(S) URL
        const wsUrl = this.agentServiceUrl.replace(/^http/, "ws");

        console.log("Connecting to agent:", wsUrl);
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
          console.log("Connected to agent service");
          this.isConnected = true;
          resolve();
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onerror = (error) => {
          console.error("WebSocket error:", error);
          this.isConnected = false;
          reject(error);
        };

        this.socket.onclose = () => {
          console.log("Disconnected from agent service");
          this.isConnected = false;
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages from agent
   */
  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      console.log("Received message from agent:", message);

      // Call registered handlers for this message type
      const handlers = this.messageHandlers.get(message.type) || [];
      handlers.forEach((handler) => handler(message.payload));
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  /**
   * Register a handler for a specific message type
   * @param {string} messageType - Type of message to handle
   * @param {Function} handler - Handler function
   */
  on(messageType, handler) {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType).push(handler);
  }

  /**
   * Remove a handler for a specific message type
   * @param {string} messageType - Type of message
   * @param {Function} handler - Handler function to remove
   */
  off(messageType, handler) {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Send a message to the agent
   * @param {string} type - Message type
   * @param {any} payload - Message payload
   */
  send(type, payload) {
    if (!this.isConnected || !this.socket) {
      console.error("Not connected to agent");
      return;
    }

    const message = {
      type,
      payload,
      timestamp: Date.now(),
    };

    this.socket.send(JSON.stringify(message));
    console.log("Sent message to agent:", message);
  }

  /**
   * Send a chat message to the agent
   * @param {string} text - Chat message text
   */
  sendChatMessage(text) {
    this.send("chat_message", { text });
  }

  /**
   * Request journey planning from agent
   * @param {Object} query - Journey query details
   */
  requestJourneyPlan(query) {
    this.send("journey_request", query);
  }

  /**
   * Send voice data to agent
   * @param {Blob} audioBlob - Audio data
   */
  async sendVoiceMessage(audioBlob) {
    // Convert audio blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);

    return new Promise((resolve, reject) => {
      reader.onload = () => {
        const base64Audio = reader.result.split(",")[1];
        this.send("voice_message", { audio: base64Audio });
        resolve();
      };
      reader.onerror = reject;
    });
  }

  /**
   * Disconnect from agent
   */
  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

/**
 * Create a communication service for an agent
 * @param {string} agentServiceUrl - WebSocket URL of the agent service
 * @returns {AgentCommunicationService}
 */
export function createAgentCommunication(agentServiceUrl) {
  return new AgentCommunicationService(agentServiceUrl);
}
