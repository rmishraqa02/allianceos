import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';

import { CreateConfigDto } from './dto/create-config.dto.js';
import { UpdateConfigDto } from './dto/update-config.dto.js';
import { SettingsService } from './settings.service.js';
import type { ConfigType } from './settings.service.js';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
  ) {}

  @Get(':type')
  findAll(
    @Req() req: any,
    @Param('type') type: ConfigType,
  ) {
    return this.settingsService.findAll(
      req.user.tenantId,
      type,
    );
  }

  @Post(':type')
  create(
    @Req() req: any,
    @Param('type') type: ConfigType,
    @Body() dto: CreateConfigDto,
  ) {
    return this.settingsService.create(
      req.user.tenantId,
      type,
      dto,
    );
  }

  @Patch(':type/:id')
  update(
    @Req() req: any,
    @Param('type') type: ConfigType,
    @Param('id') id: string,
    @Body() dto: UpdateConfigDto,
  ) {
    return this.settingsService.update(
      req.user.tenantId,
      type,
      id,
      dto,
    );
  }

  @Delete(':type/:id')
  remove(
    @Req() req: any,
    @Param('type') type: ConfigType,
    @Param('id') id: string,
  ) {
    return this.settingsService.remove(
      req.user.tenantId,
      type,
      id,
    );
  }
}