(async () => {
  const EVENT_TYPE = {
    disconnect: "DISCONNECT",
  };

  class SocketClient {
    #socket = undefined;
    #messageCallback = undefined;
    #connectCallback = undefined;
    #disconnectCallback = undefined;
    #errorCallback = undefined;

    constructor(connection) {
      this.connection = connection;
      this.isConnected = false;
    }

    connect() {
      this.#socket = new WebSocket(this.connection);
      this.#handleEvents();
    }

    send(payload) {
      if (this.isConnected) {
        this.#socket.send(payload);
      }
    }

    onMessage(callback) {
      this.#messageCallback = callback;
    }

    onConnect(callback) {
      this.#connectCallback = callback;
    }

    onDisconnect(callback) {
      this.#disconnectCallback = callback;
    }

    onError(callback) {
      this.#errorCallback = callback;
    }

    #handleEvents() {
      this.#socket.addEventListener("open", () => {
        this.isConnected = true;
        if (this.#connectCallback) this.#connectCallback();
      });
      this.#socket.addEventListener("close", () => {
        this.isConnected = false;
        if (this.#disconnectCallback) this.#disconnectCallback();
      });
      this.#socket.addEventListener("message", (event) => {
        if (this.#messageCallback) this.#messageCallback(event.data);
      });
      this.#socket.addEventListener("error", (error) => {
        if (this.#errorCallback) this.#errorCallback(error);
      });
    }
  }

  const SERVER_ENDPOINT = "ws://localhost:3000/ws";

  const connectBtn = document.getElementById("connect-btn");
  const disconnectBtn = document.getElementById("disconnect-btn");
  const messageInput = document.getElementById("message-input");
  const sendBtn = document.getElementById("send-btn");

  const barData = {
    bar1: 450,
    bar2: 450,
    bar3: 450,
  };

  const bar1 = document.getElementById("bar-1");
  const bar2 = document.getElementById("bar-2");
  const bar3 = document.getElementById("bar-3");

  const slider1 = document.getElementById("slider-1");
  const slider2 = document.getElementById("slider-2");
  const slider3 = document.getElementById("slider-3");

  disconnectBtn.disabled = true;
  // sendBtn.disabled = true;

  const client = new SocketClient(SERVER_ENDPOINT);

  client.onConnect(() => {
    console.log("client connect.");

    connectBtn.disabled = true;
    disconnectBtn.disabled = false;
    // sendBtn.disabled = false;
  });

  client.onDisconnect(() => {
    console.log("client disconnect.");

    disconnectBtn.disabled = true;
    connectBtn.disabled = false;
    // sendBtn.disabled = true;
  });

  client.onMessage((data) => {
    console.log("message: ", JSON.parse(data));
    const message = JSON.parse(data);

    bar1.style.height = message.bar1 + "px";
    bar2.style.height = message.bar2 + "px";
    bar3.style.height = message.bar3 + "px";

    slider1.value = message.bar1;
    slider2.value = message.bar2;
    slider3.value = message.bar3;
  });

  // EVENT HANDLERS
  //----------------------------------------------------------------

  slider1.addEventListener("input", (e) => {
    barData.bar1 = +(slider1.value);
    barData.bar2 = +(slider2.value);
    barData.bar3 = +(slider3.value);

    client.send(JSON.stringify({ event: "message", data: barData }));
    bar1.style.height = e.target.value + "px";
  });

  slider2.addEventListener("input", (e) => {
    barData.bar1 = +(slider1.value);
    barData.bar2 = +(slider2.value);
    barData.bar3 = +(slider3.value);

    client.send(JSON.stringify({ event: "message", data: barData }));
    bar2.style.height = e.target.value + "px";
  });

  slider3.addEventListener("input", (e) => {
    barData.bar1 = +(slider1.value);
    barData.bar2 = +(slider2.value);
    barData.bar3 = +(slider3.value);

    client.send(JSON.stringify({ event: "message", data: barData }));
    bar3.style.height = e.target.value + "px";
  });

  connectBtn.addEventListener("click", () => {
    client.connect();
  });

  disconnectBtn.addEventListener("click", () => {
    client.send(
      JSON.stringify({ event: "event", data: EVENT_TYPE.disconnect })
    );
  });

  // sendBtn.addEventListener("click", () => {
  //   const message = messageInput.value;
  //   client.send(JSON.stringify({ event: "message", data: message }));
  //   messageInput.value = "";
  // });
})();
