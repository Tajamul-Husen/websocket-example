import { Module } from '@nestjs/common';
import { EventGateway } from './events.gateway';
import { EventService } from './events.service';
import { EventSubscription } from './events.subscription';

@Module({
  providers: [EventGateway, EventService, EventSubscription],
  exports: [EventService, EventSubscription]
})
export class EventsModule {}