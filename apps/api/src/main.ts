import '@js-temporal/polyfill';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module.js';

import { Temporal } from '@js-temporal/polyfill';

globalThis.Temporal = Temporal;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  await app.listen(
    process.env.PORT || 3001,
    '0.0.0.0',
  );
}

bootstrap();