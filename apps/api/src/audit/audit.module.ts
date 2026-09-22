import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../auth/auth.module.js';

import { AuditController } from './audit.controller.js';
import { AuditService } from './audit.service.js';

@Module({
  imports: [
    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
  ],

  controllers: [
    AuditController,
  ],

  providers: [
    AuditService,
  ],

  exports: [
    AuditService,
  ],
})
export class AuditModule {}