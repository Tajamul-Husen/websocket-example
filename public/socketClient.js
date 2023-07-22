export class SocketClient {
  #socket = undefined; // socket object
  #messageCallback = undefined;
  #connectCallback = undefined;
  #disconnectCallback = undefined;
  #errorCallback = undefined;

  constructor(connectionString) {
    this.connectionURL = connectionString;
  }

  /**
   * Connect to the socket server
   *
   * @return {void} void
   */
  connect() {
    this.#socket = new WebSocket(this.connectionURL);
    this.#handleEvents();
  }

  /**
   * Send message to socket server
   *
   * @param {string} payload - message payload
   * @return {void} void
   */
  send(payload) {
    if (this.#socket.readyState === this.#socket.OPEN) {
      this.#socket.send(payload);
    }
  }

  /**
   * Disconnect to the socket server
   *
   * @return {void} void
   */
  disconnect() {
    if (this.#socket.readyState === this.#socket.OPEN) {
      this.#socket.close();
    }
  }

  /**
   * Message callback for listening incoming messages
   *
   * @param {(data: string)=>} callbackFn - A callback to get event.
   * @return {void} void
   */
  onMessage(callbackFn) {
    this.#messageCallback = callbackFn;
  }

  /**
   * Connect callback for getting connection event
   *
   * @param {()=>} callbackFn - A callback to get event.
   * @return {void} void
   */
  onConnect(callbackFn) {
    this.#connectCallback = callbackFn;
  }

  /**
   * Disconnect callback for getting disconnection event
   *
   * @param {()=>} callbackFn - A callback to get event.
   * @return {void} void
   */
  onDisconnect(callbackFn) {
    this.#disconnectCallback = callbackFn;
  }

  /**
   * Error callback for getting error event
   *
   * @param {(error: any)=>} callbackFn - A callback to get event.
   * @return {void} void
   */
  onError(callbackFn) {
    this.#errorCallback = callbackFn;
  }

  /**
   * Get current status of the connection - OPEN, CLOSED, CONNECTING, CLOSED
   *
   * @return {string} status
   */
  getConnectionStatus() {
    if (this.#socket) {
      switch (this.#socket.readyState) {
        case this.#socket.CONNECTING:
          return 'CONNECTING';
        case this.#socket.OPEN:
          return 'OPEN';
        case this.#socket.CLOSING:
          return 'CLOSING';
        case this.#socket.CLOSED:
          return 'CLOSED';
      }
    }
    return 'NONE';
  }

  /**
   * Check if the connection is connected
   *
   * @return {boolean} status
   */
  isConnected() {
    return this.#socket && this.#socket.readyState === this.#socket.OPEN
      ? true
      : false;
  }

  #handleEvents() {
    this.#socket.addEventListener('open', () => {
      if (this.#connectCallback) this.#connectCallback();
    });
    this.#socket.addEventListener('close', () => {
      if (this.#disconnectCallback) this.#disconnectCallback();
    });
    this.#socket.addEventListener('message', (event) => {
      if (this.#messageCallback) this.#messageCallback(event.data);
    });
    this.#socket.addEventListener('error', (error) => {
      if (this.#errorCallback) this.#errorCallback(error);
    });
  }
}

export const EVENT_TYPE = {
  connectionID: 'CONNECTION_ID',
};
