import { Module } from '@nestjs/common';

import { DynamoDBService } from './dynamodb.service.js';

/**
 * Provides and exports the shared DynamoDB service.
 *
 * Allows other modules to access the configured DynamoDB client
 * through NestJS dependency injection.
 */
@Module({
  providers: [DynamoDBService],
  exports: [DynamoDBService],
})
export class DynamoDBModule {}
