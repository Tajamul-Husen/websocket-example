import {
  MessageBody,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { EventService } from './events.service';

@WebSocketGateway({
  path: '/ws',
  cors: {
    origin: '*',
  },
})
export class EventSubscription {
  constructor(private eventService: EventService) {}

  @SubscribeMessage('message')
  onMessage(@MessageBody() payload: string, @ConnectedSocket() client: any) {
    console.log('MESSAGE_PAYLOAD: ', payload);
    this.eventService.broadcast(client, payload);
    // return payload;  // send message acknowledgement back to client
  }

  @SubscribeMessage('event')
  onEvent(@MessageBody() payload: string, @ConnectedSocket() client: any) {
    console.log('EVENT_PAYLOAD: ', payload);
    this.eventService.handleEvent(client, payload);
  }
}
