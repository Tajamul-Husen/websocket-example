import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { WsAdapter } from '@nestjs/platform-ws';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useWebSocketAdapter(new WsAdapter(app));
  app.useStaticAssets(join(__dirname, '..', 'public'), { prefix: '/test/client' });

  await app.listen(3000);
}
bootstrap();
