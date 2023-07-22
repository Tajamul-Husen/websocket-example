import { Test, TestingModule } from '@nestjs/testing';
import { EventGateway } from './events.gateway';
import { EventService } from './events.service';

describe('Websocket Gateway', () => {
  let gateway: EventGateway;
  let service: EventService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [EventGateway, EventService],
    }).compile();

    gateway = app.get<EventGateway>(EventGateway);
    service = app.get<EventService>(EventService);
  });

  it('Websocket Gateway should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
