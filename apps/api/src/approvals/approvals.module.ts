import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../auth/auth.module.js';

import { AuditModule } from '../audit/audit.module.js';

import { ApprovalsController } from './approvals.controller.js';
import { ApprovalsService } from './approvals.service.js';

@Module({
  imports: [
    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    AuditModule,
  ],

  controllers: [
    ApprovalsController,
  ],

  providers: [
    ApprovalsService,
  ],

  exports: [
    ApprovalsService,
  ],
})
export class ApprovalsModule {}