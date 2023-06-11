import { Injectable, Logger } from '@nestjs/common';
import { generateUid } from 'src/helpers';

@Injectable()
export class EventService {
  private logger: Logger = new Logger(EventService.name);
  private connections = new Map<string, any>();
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
    if (connection.id && this.connections.has(connection.id)) return;

    connection.id = generateUid();
    this.connections.set(connection.id, connection);
  }

  removeConnection(connection: any): boolean {
    if (connection.id && this.connections.has(connection.id)) {
      return this.connections.delete(connection.id);
    }
    return false;
  }

  getConnection(connectionId: string): any {
    if (connectionId && this.connections.has(connectionId)) {
      return this.connections.get(connectionId);
    }
    return undefined;
  }

  closeAllConnection() {
    this.connections.forEach((connection) => connection.terminate());
    this.connections.clear();
  }

  closeConnection(connection) {
    connection.terminate();
    this.removeConnection(connection);
  }

  initConnection(connection) {
    connection.isAlive = true;
    connection.on('pong', () => (connection.isAlive = true));
  }

  private setHeartbeatInterval() {
    this.heartbeatInterval = setInterval(() => {
      for (const connection of this.connections.values()) {
        if (connection.isAlive === false) return connection.terminate();
        connection.isAlive = false;
        connection.ping();
      }
    }, this.heartbeatIntervalDelay * 1000);
  }

  private clearHeartbeatInterval() {
    clearInterval(this.heartbeatInterval);
  }

  handleEvent(connection: any, eventType: string) {
    switch (eventType) {
      case 'DISCONNECT':
        this.closeConnection(connection);
        break;

      default:
        break;
    }
  }

  send(connectionId: string, payload: string) {
    const connection = this.getConnection(connectionId);
    if (!connection) {
      throw new Error('No connection found belong to that ID.');
    }
    connection.send(JSON.stringify(payload));
  }

  broadcast(myConnection: any, payload: any) {
    for (let connection of this.connections.values()) {
      if (connection.id !== myConnection.id) {
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
}
