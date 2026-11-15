import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';

/** Exposes the application-level status greeting. */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  /** Returns the greeting used by the root route. */
  getHello(): string {
    return this.appService.getHello();
  }
}
