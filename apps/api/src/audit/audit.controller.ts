import {
  Controller,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { RequestWithUser } from '../auth/types/authenticated-user.js';

import { AuditService } from './audit.service.js';

@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(
    private readonly auditService: AuditService,
  ) {}

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.auditService.findAll(
      req.user.tenantId,
    );
  }

  @Get('/:entityType/:entityId')
  findByEntity(
    @Req() req: RequestWithUser,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(
      entityType,
      entityId,
      req.user.tenantId,
    );
  }
}