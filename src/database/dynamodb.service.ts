import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

/**
 * Provides a configured DynamoDB Document Client.
 *
 * Manages the underlying DynamoDB connection and exposes a
 * document client for use by application repositories.
 *
 * Supports both local DynamoDB endpoints and AWS-managed
 * DynamoDB environments through environment configuration.
 */
@Injectable()
export class DynamoDBService implements OnModuleDestroy {
  private readonly client: DynamoDBClient;

  /** Shared document client used for DynamoDB operations. */
  readonly documentClient: DynamoDBDocumentClient;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('DYNAMODB_ENDPOINT');

    this.client = new DynamoDBClient({
      region: this.configService.get<string>('AWS_REGION', 'ap-southeast-2'),

      // Use explicit placeholder credentials for local development.
      // AWS environments use the default credential provider chain.
      ...(endpoint
        ? {
            endpoint,
            credentials: {
              accessKeyId: this.configService.get<string>(
                'AWS_ACCESS_KEY_ID',
                'local',
              ),
              secretAccessKey: this.configService.get<string>(
                'AWS_SECRET_ACCESS_KEY',
                'local',
              ),
            },
          }
        : {}),
    });

    this.documentClient = DynamoDBDocumentClient.from(this.client, {
      marshallOptions: {
        // Exclude undefined properties when converting JavaScript objects
        // into DynamoDB items.
        removeUndefinedValues: true,
      },
    });
  }

  /**
   * Releases the underlying DynamoDB client during application shutdown.
   */
  onModuleDestroy(): void {
    this.client.destroy();
  }
}
