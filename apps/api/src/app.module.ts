import { Module } from '@nestjs/common';

import { AppController } from './app.controller.js';

import { PrismaModule } from './prisma/prisma.module.js';

import { PartnersModule } from './partners/partners.module.js';

import { CustomersModule } from './customers/customers.module.js';

import { DealsModule } from './deals/deals.module.js';

import { UsersModule } from './users/users.module.js';

import { AuthModule } from './auth/auth.module.js';

import { TenantsModule } from './tenants/tenants.module.js';

import { SettingsModule } from './settings/settings.module.js';

import { ApprovalsModule } from './approvals/approvals.module.js';

import { AuditModule } from './audit/audit.module.js';

import { GtmModule } from './gtm/gtm.module.js';

@Module({
  imports: [
    PrismaModule,

    PartnersModule,

    CustomersModule,

    DealsModule,

    UsersModule,

    AuthModule,

    TenantsModule,

    SettingsModule,

    ApprovalsModule,

    AuditModule,

    GtmModule,
  ],

  controllers: [AppController],
})
export class AppModule {}