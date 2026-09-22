import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { RequestWithUser } from '../auth/types/authenticated-user.js';

import { ApprovalsService } from './approvals.service.js';
import { CreateApprovalDto } from './dto/create-approval.dto.js';
import { ReviewApprovalDto } from './dto/review-approval.dto.js';

@Controller('approvals')
@UseGuards(JwtAuthGuard)
export class ApprovalsController {
  constructor(
    private readonly approvalsService: ApprovalsService,
  ) {}

  @Post()
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateApprovalDto,
  ) {
    return this.approvalsService.create(
      dto,
      req.user.tenantId,
      req.user.userId,
    );
  }

  @Get()
  findAll(
    @Req() req: RequestWithUser,
  ) {
    return this.approvalsService.findAll(
      req.user.tenantId,
    );
  }

  @Get(':id')
  findOne(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.approvalsService.findOne(
      id,
      req.user.tenantId,
    );
  }

  @Post(':id/approve')
  approve(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ReviewApprovalDto,
  ) {
    return this.approvalsService.approve(
      id,
      req.user.tenantId,
      req.user.userId,
      dto,
    );
  }

  @Post(':id/reject')
  reject(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: ReviewApprovalDto,
  ) {
    return this.approvalsService.reject(
      id,
      req.user.tenantId,
      req.user.userId,
      dto,
    );
  }
}