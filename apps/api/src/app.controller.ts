import { Controller, Get } from '@nestjs/common';
import { APP_CREDIT, APP_NAME } from '@novanode/shared';
import { Public } from './auth/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', service: APP_NAME, credit: APP_CREDIT };
  }
}
