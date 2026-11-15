import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

/** Creates the Nest application and starts listening on the configured port. */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
