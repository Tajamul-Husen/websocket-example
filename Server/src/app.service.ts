import { Injectable } from '@nestjs/common';
import { EventService } from './modules/events/events.service';

@Injectable()
export class AppService {
  constructor(private eventService: EventService) {}

  healthCheck(): { status: string } {
    return { status: 'ok' };
  }

  async sendMessage(clientId: string, message: string) {
    await this.eventService.send(clientId, message);
  }
}
