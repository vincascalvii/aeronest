import { Injectable } from '@nestjs/common';

/** Provides the application-level response used by the root route. */
@Injectable()
export class AppService {
  /** Returns a lightweight response for the root endpoint. */
  getHello(): string {
    return 'Hello World!';
  }
}
