import { SocketClient, EVENT_TYPE } from './socketClient.js';

(async () => {
  document.addEventListener('DOMContentLoaded', (event) => {
    const connectBtn = document.getElementById('connect-btn');
    const disconnectBtn = document.getElementById('disconnect-btn');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const connectionStatusText = document.getElementById(
      'connection-status-text',
    );
    const connectionIdText = document.getElementById('connection-id-text');
    const displayMessageBox = document.getElementById('display-message-box');
    const clearBtn = document.getElementById('clear-btn');
    const messagePayloadTypeOption = document.getElementById(
      'message-payload-type-option',
    );

    let messagePayloadType = 'string';

    const placeholders = {
      json: `e.g. \n\n{\n\t event: "message", \n\t data: "Hello World" \n }`,
      string: `e.g.\t Hello World`,
    };

    disconnectBtn.disabled = true;
    sendBtn.disabled = true;
    messageInput.disabled = true;
    displayMessageBox.readOnly = true;

    connectionStatusText.innerText = 'Not Connected';
    connectionStatusText.style.color = 'red';
    connectionStatusText.style.fontWeight = 'bold';
    connectionIdText.innerText = '';
    connectionIdText.style.color = 'black';
    connectionIdText.style.fontWeight = 'bold';
    messagePayloadTypeOption.disabled = true;

    messageInput.placeholder = placeholders[messagePayloadTypeOption.value];

    // =====================================================================================

    const location = window.location;

    const SERVER_PROTOCOL = `${location.protocol === 'https:' ? 'wss' : 'ws'}`;
    const SERVER_HOST = location.host;
    const SOCKET_PATH = 'ws';

    const SOCKET_SERVER_URI = `${SERVER_PROTOCOL}://${SERVER_HOST}/${SOCKET_PATH}`;
    console.log('SOCKET_SERVER_URI: ', SOCKET_SERVER_URI);

    // configure socket client
    const client = new SocketClient(SOCKET_SERVER_URI);

    client.onConnect(() => {
      console.log('CLIENT_CONNECTED');

      connectBtn.disabled = true;
      disconnectBtn.disabled = false;
      messageInput.disabled = false;
      sendBtn.disabled = false;
      messagePayloadTypeOption.disabled = false;

      messageInput.value = '';
      connectionStatusText.innerText = 'Connected';
      connectionStatusText.style.color = 'green';
    });

    client.onDisconnect(() => {
      console.log('CLIENT_DISCONNECTED');

      connectBtn.disabled = false;
      disconnectBtn.disabled = true;
      messageInput.disabled = true;
      sendBtn.disabled = true;
      messagePayloadTypeOption.disabled = true;

      messageInput.value = '';
      connectionStatusText.innerText = 'Not Connected';
      connectionStatusText.style.color = 'red';
      connectionIdText.innerText = '';
    });

    client.onMessage((message) => {
      console.log('RECEIVED_MESSAGE_PAYLOAD: ', message);

      let parsedMessage = undefined;

      try {
        parsedMessage = JSON.parse(message);
      } catch (error) {
        console.log(
          'Failed to parse incoming message: ',
          error.message || error,
        );
        parsedMessage = message;
      }

      // get connection ID message for new connection
      if (
        parsedMessage &&
        parsedMessage.event &&
        parsedMessage.data &&
        parsedMessage.event === EVENT_TYPE.connectionID
      ) {
        connectionIdText.innerText = parsedMessage.data;
      }

      const messageBody = {
        message: parsedMessage,
        timestamp: new Date().toISOString(),
      };

      const previousMessages = displayMessageBox.value;

      displayMessageBox.value = formatMessage(
        previousMessages,
        JSON.stringify(messageBody, null, 4),
      );
    });

    client.onError((error) => console.error('SOCKET_CLIENT_ERROR: ', error));

    connectBtn.addEventListener('click', () => client.connect());

    disconnectBtn.addEventListener('click', () => client.disconnect());

    clearBtn.addEventListener('click', () => (displayMessageBox.value = ''));

    messagePayloadTypeOption.addEventListener('change', function () {
      messagePayloadType = this.value;
      messageInput.placeholder = placeholders[this.value];
    });

    sendBtn.addEventListener('click', () => {
      let messagePayload = messageInput.value;

      if (!messagePayload) {
        alert('Please enter a valid message.');
        return;
      }

      // json payload sanity check
      if (messagePayloadType === 'json') {
        try {
          messagePayload = JSON.parse(messagePayload);
        } catch (error) {
          alert('Please enter a valid json message.');
          return;
        }
      }

      const serializedMessage = JSON.stringify(messagePayload);

      console.log('SEND_MESSAGE_PAYLOAD: ', serializedMessage);
      client.send(serializedMessage);

      messageInput.value = '';
    });

    function formatMessage(oldMessage, newMessage) {
      let separator = '==========================================================\n';
      separator +=
        '==========================================================';

      return `${oldMessage}${
        oldMessage ? `\n\n${separator}\n\n` : ''
      }${newMessage}`;
    }
  });
})();
