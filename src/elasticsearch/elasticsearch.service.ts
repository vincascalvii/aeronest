import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';

/**
 * Provides a configured Elasticsearch client.
 *
 * Manages the Elasticsearch connection and exposes the client
 * for use by application repositories.
 */
@Injectable()
export class ElasticsearchService implements OnModuleDestroy {
  readonly client: Client;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      node: this.configService.getOrThrow<string>('ELASTICSEARCH_NODE'),
    });
  }

  /**
   * Releases the Elasticsearch client during application shutdown.
   */
  async onModuleDestroy(): Promise<void> {
    await this.client.close();
  }
}
