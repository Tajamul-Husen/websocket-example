import { Injectable, Logger } from '@nestjs/common';
import { generateUID } from 'src/helpers';

@Injectable()
export class EventService {
  private logger: Logger = new Logger(EventService.name);
  private connectionPool = new Map<string, any>();
  private heartbeatInterval = undefined;
  private heartbeatIntervalDelay = 30; // sec

  constructor() {}

  onInit() {
    this.setHeartbeatInterval();
  }

  onCleanup() {
    this.closeAllConnection();
    this.clearHeartbeatInterval();
  }

  addConnection(connection: any) {
    const found = this.getConnection(connection.id);
    if (found) {
      throw new Error(
        `Connection ID - (${connection.id}) is already connected`,
      );
    }

    connection.id = generateUID();
    this.setConnection(connection.id, connection);

    const payload = {
      event: 'CONNECTION_ID',
      data: connection.id,
    };

    try {
      this.send(connection.id, payload);
    } catch (error) {
      throw error;
    }
  }

  removeConnection(connectionId: string) {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error(`No active connection found for ID - (${connectionId}).`);
    }

    this.connectionPool.delete(connectionId);
  }

  closeAllConnection() {
    this.connectionPool.forEach((connection) => connection.terminate());
    this.connectionPool.clear();
  }

  initConnection(connection) {
    connection.isAlive = true;
    connection.on('pong', () => (connection.isAlive = true));
  }

  handleEvent(connection: any, payload: any, event: string) {
    if (typeof payload === 'string') {
      return `Field parameter 'eventType' and 'message' required for sending an event.`;
    }

    const eventType = payload.eventType;
    const message = payload.message;

    if (!eventType || !message) {
      return `Field parameter 'eventType' and 'message' required for sending an event.`;
    }

    switch (eventType) {
      case 'TEST':
        break;

      default:
        return `No Event found to handle for event type - (${eventType}).`;
    }
  }

  sendMessage(connectionId, payload, event): string {
    if (typeof payload === 'string') {
      return `Field parameter 'receiverId' and 'message' required for sending messages.`;
    }

    const receiverId = payload.receiverId;
    const message = payload.message;

    if (!receiverId || !message) {
      return `Field parameter 'receiverId' and 'message' required for sending messages.`;
    }

    const messageBody = {
      event: event,
      data: { senderId: connectionId, message: message },
    };

    try {
      this.send(receiverId, messageBody);
    } catch (error) {
      return error.message || error;
    }

    return `Message sent to connection ID - (${receiverId}).`;
  }

  sendBroadcast(connectionId, payload, event): string {
    if (typeof payload === 'string') {
      return `Field parameter 'message' required for sending a broadcast.`;
    }

    const message = payload.message;
    if (!message) {
      return `Field parameter 'message' required for sending a broadcast.`;
    }

    const messageBody = {
      event: event,
      data: { senderId: connectionId, message: message },
    };

    this.broadcast(connectionId, messageBody);
    return 'Broadcast message sent.';
  }

  send(connectionId, payload) {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error(
        `No active connection found for connection Id - (${connectionId}).`,
      );
    }
    connection.send(JSON.stringify(payload));
  }

  broadcast(senderConnectionId: any, payload: any) {
    for (const connection of this.connectionPool.values()) {
      if (connection.id !== senderConnectionId) {
        connection.send(JSON.stringify(payload));
      }
    }
  }

  parseConnectionArgs(args: any) {
    if (args && args[0]) {
      return {
        headers: args[0]?.headers || {},
        url: args[0]?.url || '',
      };
    }
  }

  private getConnection(connectionId: string): any | undefined {
    if (this.connectionPool.has(connectionId)) {
      return this.connectionPool.get(connectionId);
    }
    return undefined;
  }

  private setConnection(connectionId: string, connection: any) {
    this.connectionPool.set(connectionId, connection);
  }

  private setHeartbeatInterval() {
    this.heartbeatInterval = setInterval(() => {
      for (const connection of this.connectionPool.values()) {
        if (connection.isAlive === false) return connection.terminate();
        connection.isAlive = false;
        connection.ping();
      }
    }, this.heartbeatIntervalDelay * 1000);
  }

  private clearHeartbeatInterval() {
    clearInterval(this.heartbeatInterval);
  }
}
