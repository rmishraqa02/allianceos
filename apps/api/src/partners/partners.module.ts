import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../auth/auth.module.js';
import { PartnersController } from './partners.controller.js';
import { PartnersService } from './partners.service.js';

@Module({
  imports: [
    AuthModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],
  controllers: [PartnersController],
  providers: [PartnersService],
})
export class PartnersModule {}