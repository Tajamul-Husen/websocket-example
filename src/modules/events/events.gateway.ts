import { Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'ws';
import { EventService } from './events.service';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
  },
})
export class EventGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnApplicationShutdown
{
  private logger: Logger = new Logger(EventGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private eventService: EventService) {}

  afterInit(server: Server): void {
    this.logger.log('Websocket Server Initialized.');

    this.eventService.onInit();
    server.on('close', () => console.log('Websocket Server Closed.'));
  }

  onApplicationShutdown(signal?: string) {
    this.eventService.onCleanup();
  }

  handleConnection(client: any, ...args: any[]) {
    try {
      this.eventService.initConnection(client);
      this.eventService.addConnection(client);
      this.logger.log(`Client Connected: ${client.id}`);
    } catch (error) {
      this.logger.error(error.message || error);
    }
  }

  handleDisconnect(client: any) {
    try {
      this.eventService.removeConnection(client.id);
      this.logger.log(`Client Disconnected: ${client.id}`);
    } catch (error) {
      this.logger.error(error.message || error);
    }
  }
}
