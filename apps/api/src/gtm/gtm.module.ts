import { Module } from '@nestjs/common';

import { GtmController } from './gtm.controller.js';
import { GtmService } from './gtm.service.js';
import { McpClientService } from './mcp-client.service.js';

@Module({
  controllers: [GtmController],
  providers: [
    GtmService,
    McpClientService,
  ],
})
export class GtmModule {}
