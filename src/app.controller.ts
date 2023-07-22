import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  Post,
} from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/health-check')
  getHello() {
    return this.appService.healthCheck();
  }

  @Post('/message')
  async sendMessage(@Body() body: any): Promise<any> {
    try {
      await this.appService.sendMessage(body.clientId, body.message);
      return { code: 200, message: 'success' };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
}
