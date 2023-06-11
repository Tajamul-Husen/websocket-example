import { Logger } from '@nestjs/common';
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
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private logger: Logger = new Logger(EventGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private eventService: EventService) {}

  afterInit(server: Server): void {
    this.logger.log('Websocket Server Initialized.');

    this.eventService.onInit();
    server.on('close', () => this.eventService.onCleanup());
  }

  handleConnection(client: any, ...args: any[]) {
    this.eventService.initConnection(client);
    this.eventService.addConnection(client);
    this.logger.log('Client Connected: ', client.id);
  }

  handleDisconnect(client: any) {
    this.eventService.removeConnection(client);
    this.logger.log('Client Disconnected: ', client.id);
  }
}
