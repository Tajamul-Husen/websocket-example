import { Logger } from '@nestjs/common';
import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventService } from './events.service';
import { EVENT_SUBSCRIPTION } from './const/eventSubscription';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
  },
})
export class EventSubscription {
  private logger: Logger = new Logger(EventSubscription.name);

  constructor(private eventService: EventService) {}

  @SubscribeMessage(EVENT_SUBSCRIPTION.MESSAGE)
  onMessage(@MessageBody() payload: any, @ConnectedSocket() client: any) {
    this.logger.log(`MESSAGE_PAYLOAD: ${JSON.stringify(payload)}`);
    const resultMessage = this.eventService.sendMessage(client.id, payload, EVENT_SUBSCRIPTION.MESSAGE);
    return resultMessage; // send message acknowledgement back to client
  }

  @SubscribeMessage(EVENT_SUBSCRIPTION.BROADCAST)
  onBroadcast(@MessageBody() payload: any, @ConnectedSocket() client: any) {
    this.logger.log(`BROADCAST_PAYLOAD: ${JSON.stringify(payload)}`);
    const resultMessage = this.eventService.sendBroadcast(client.id, payload, EVENT_SUBSCRIPTION.BROADCAST);
    return resultMessage; // send message acknowledgement back to client
  }

  @SubscribeMessage(EVENT_SUBSCRIPTION.EVENT)
  onEvent(@MessageBody() payload: any, @ConnectedSocket() client: any) {
    this.logger.log(`EVENT_PAYLOAD: ${JSON.stringify(payload)}`);
    const resultMessage = this.eventService.handleEvent(client, payload, EVENT_SUBSCRIPTION.EVENT);
    return resultMessage; // send message acknowledgement back to client
  }
}
