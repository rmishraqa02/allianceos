import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';

import { AuthModule } from '../auth/auth.module.js';
import { ApprovalsModule } from '../approvals/approvals.module.js';
import { AuditModule } from '../audit/audit.module.js';

import { DealsController } from './deals.controller.js';
import { DealsService } from './deals.service.js';

@Module({
  imports: [
    AuthModule,

    PassportModule.register({
      defaultStrategy: 'jwt',
    }),

    ApprovalsModule,
    AuditModule,
  ],

  controllers: [DealsController],

  providers: [DealsService],

  exports: [DealsService],
})
export class DealsModule {}