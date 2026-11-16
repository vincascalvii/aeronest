import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { DynamoDBService } from '../../database/dynamodb.service.js';
import { Flight } from '../entities/flight.entity.js';

/**
 * Handles persistence operations for flight records.
 *
 * Provides methods for retrieving flight data from DynamoDB
 * and abstracts database operations from the application layer.
 */
@Injectable()
export class FlightsRepository {
  constructor(
    private readonly dynamoDBService: DynamoDBService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves a flight using its unique partition key.
   *
   * Executes a DynamoDB GetItem operation against the configured
   * flights table.
   *
   * @param id - The unique identifier of the flight.
   * @returns A promise resolving to the flight record, or undefined if no matching record exists.
   */
  async findById(id: string): Promise<Flight | undefined> {
    const result = await this.dynamoDBService.documentClient.send(
      new GetCommand({
        TableName: this.configService.getOrThrow<string>(
          'DYNAMODB_FLIGHTS_TABLE',
        ),
        Key: {
          flightId: id,
        },
      }),
    );

    // DynamoDB does not validate records against TypeScript interfaces.
    // This assertion assumes stored records follow the Flight structure.
    return result.Item as Flight | undefined;
  }

  /**
   * Saves a new flight record to DynamoDB.
   *
   * Prevents an existing flight ID from being overwritten.
   *
   * @param flight - The flight record to persist.
   * @returns A promise that resolves when the operation completes.
   */
  async create(flight: Flight): Promise<void> {
    await this.dynamoDBService.documentClient.send(
      new PutCommand({
        TableName: this.configService.getOrThrow<string>(
          'DYNAMODB_FLIGHTS_TABLE',
        ),
        Item: flight,
        ConditionExpression: 'attribute_not_exists(flightId)',
      }),
    );
  }
}
