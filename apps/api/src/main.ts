import '@js-temporal/polyfill';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { Temporal } from '@js-temporal/polyfill';

globalThis.Temporal = Temporal;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(3001);
}

bootstrap();