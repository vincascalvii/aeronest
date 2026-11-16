import { Module } from '@nestjs/common';

import { FlightsController } from './flights.controller.js';
import { FlightsService } from './flights.service.js';
import { FlightsRepository } from './repositories/flights.repository.js';
import { FlightsSearchRepository } from './repositories/flights-search.repository.js';

import { DynamoDBModule } from '../database/dynamodb.module.js';
import { ElasticsearchModule } from '../elasticsearch/elasticsearch.module.js';

/**
 * Configures the Flights feature module.
 *
 * Registers the flight controller, service and repository,
 * and imports the DynamoDB module for database access.
 */
@Module({
  imports: [DynamoDBModule, ElasticsearchModule],
  controllers: [FlightsController],
  providers: [FlightsService, FlightsRepository, FlightsSearchRepository],
})
export class FlightsModule {}
