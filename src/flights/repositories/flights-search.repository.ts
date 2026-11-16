import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { ElasticsearchService } from '../../elasticsearch/elasticsearch.service.js';
import { Flight } from '../entities/flight.entity.js';

import { FlightSearchDto } from '../dto/flight-search.dto.js';
import { FlightSearchResult } from '../entities/flight-search-result.entity.js';

/**
 * Handles flight search-index operations.
 *
 * Manages the Elasticsearch flights index and provides
 * methods for indexing flight records.
 */
@Injectable()
export class FlightsSearchRepository implements OnModuleInit {
  private readonly indexName: string;

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly configService: ConfigService,
  ) {
    this.indexName = this.configService.get<string>(
      'ELASTICSEARCH_FLIGHTS_INDEX',
      'flights',
    );
  }

  /**
   * Ensures the flights index exists when the application starts.
   */
  async onModuleInit(): Promise<void> {
    await this.ensureIndex();
  }

  /**
   * Creates the flights index if it does not already exist.
   */
  private async ensureIndex(): Promise<void> {
    const client = this.elasticsearchService.client;

    const exists = await client.indices.exists({
      index: this.indexName,
    });

    if (exists) {
      return;
    }

    await client.indices.create({
      index: this.indexName,
      settings: {
        number_of_shards: 1,
        number_of_replicas: 0,
      },
      mappings: {
        properties: {
          flightId: { type: 'keyword' },
          flightNumber: { type: 'keyword' },
          airline: { type: 'keyword' },
          origin: { type: 'keyword' },
          destination: { type: 'keyword' },
          departureTime: { type: 'date' },
          arrivalTime: { type: 'date' },
          price: { type: 'double' },
          currency: { type: 'keyword' },
        },
      },
    });
  }

  /**
   * Adds or updates a flight document in Elasticsearch.
   *
   * Uses flightId as the Elasticsearch document ID.
   */
  async indexFlight(flight: Flight): Promise<void> {
    await this.elasticsearchService.client.index({
      index: this.indexName,
      id: flight.flightId,
      document: flight,
    });
  }

  /**
   * Searches flights using origin, destination and departure date.
   *
   * Applies pagination and sorts results by departure time.
   */
  async searchFlights(filters: FlightSearchDto): Promise<FlightSearchResult> {
    const { origin, destination, departureDate, page, limit } = filters;

    // Calculate the UTC start and end of the requested departure date.
    const startDate = new Date(`${departureDate}T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCDate(endDate.getUTCDate() + 1);

    // Elasticsearch pagination uses a zero-based offset.
    const from = (page - 1) * limit;

    const response = await this.elasticsearchService.client.search<Flight>({
      index: this.indexName,

      from,
      size: limit,

      // Request an accurate total count for pagination.
      track_total_hits: true,

      query: {
        bool: {
          filter: [
            {
              term: {
                origin,
              },
            },
            {
              term: {
                destination,
              },
            },
            {
              range: {
                departureTime: {
                  gte: startDate.toISOString(),
                  lt: endDate.toISOString(),
                },
              },
            },
          ],
        },
      },

      sort: [
        {
          departureTime: {
            order: 'asc',
          },
        },
      ],
    });

    // Elasticsearch can return the total as either a number
    // or an object containing the count and relation.
    const total =
      typeof response.hits.total === 'number'
        ? response.hits.total
        : (response.hits.total?.value ?? 0);

    const flights = response.hits.hits.flatMap((hit) =>
      hit._source ? [hit._source] : [],
    );

    return {
      flights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
