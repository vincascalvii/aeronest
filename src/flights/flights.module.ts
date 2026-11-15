import { Module } from '@nestjs/common';

import { FlightsController } from './flights.controller.js';
import { FlightsService } from './flights.service.js';
import { FlightsRepository } from './repositories/flights.repository.js';
import { DynamoDBModule } from '../database/dynamodb.module.js';

/**
 * Configures the Flights feature module.
 *
 * Registers the flight controller, service and repository,
 * and imports the DynamoDB module for database access.
 */
@Module({
  imports: [DynamoDBModule],
  controllers: [FlightsController],
  providers: [FlightsService, FlightsRepository],
})
export class FlightsModule {}
