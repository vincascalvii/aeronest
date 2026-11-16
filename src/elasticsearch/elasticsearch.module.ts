import { Module } from '@nestjs/common';
import { ElasticsearchService } from './elasticsearch.service.js';

/**
 * Provides and exports the shared Elasticsearch client service.
 *
 * Allows other modules to access Elasticsearch through
 * NestJS dependency injection.
 */
@Module({
  providers: [ElasticsearchService],
  exports: [ElasticsearchService],
})
export class ElasticsearchModule {}
