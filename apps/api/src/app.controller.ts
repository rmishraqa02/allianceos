import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return {
      service: 'allianceos-api',
      status: 'UP',
    };
  }

  @Get('health')
  getHealth() {
    return {
      service: 'allianceos-api',
      status: 'UP',
      timestamp: new Date().toISOString(),
    };
  }
}