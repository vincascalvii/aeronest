import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FlightsModule } from './flights/flights.module.js';

/** Composes the application modules and makes environment configuration global. */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    FlightsModule,
  ],
})
export class AppModule {}
