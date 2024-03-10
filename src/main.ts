import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';

if (process.env.IS_TS_NODE) {
  require('module-alias/register');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  await app.listen(5001);
}

bootstrap();
