import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';

import { FlightsRepository } from './repositories/flights.repository.js';
import { FlightsSearchRepository } from './repositories/flights-search.repository.js';
import { Flight } from './entities/flight.entity.js';
import { FlightSearchDto } from './dto/flight-search.dto.js';
import { FlightSearchResult } from './entities/flight-search-result.entity.js';
import { CreateFlightDto } from './dto/create-flight.dto.js';

/**
 * Provides business logic for flight-related operations.
 *
 * Coordinates flight retrieval and delegates data access
 * to the FlightsRepository.
 */
@Injectable()
export class FlightsService {
  constructor(
    private readonly flightsRepository: FlightsRepository,
    private readonly flightsSearchRepository: FlightsSearchRepository,
  ) {}

  /**
   * Retrieves a flight by its unique identifier.
   *
   * @param id - The unique identifier of the flight.
   * @returns A promise resolving to the matching flight record.
   * @throws {NotFoundException} If no flight exists with the specified ID.
   */
  async findOne(id: string): Promise<Flight> {
    const flight = await this.flightsRepository.findById(id);

    // Convert a missing database record into an HTTP 404 response.
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }

    return flight;
  }

  /**
   * Searches flights using Elasticsearch.
   *
   * @param filters - The search criteria including origin, destination, departure date, and optional pagination parameters.
   * @returns A promise resolving to the search results, including matching flights and pagination details.
   */
  async search(filters: FlightSearchDto): Promise<FlightSearchResult> {
    return this.flightsSearchRepository.searchFlights(filters);
  }

  /**
   * Creates a flight in DynamoDB and indexes it in Elasticsearch.
   *
   * DynamoDB is written first because it is the source of truth.
   *
   * @param dto - The flight data to create.
   * @returns A promise resolving to the created flight record.
   * @throws {ConflictException} If a flight with the same ID already exists.
   */
  async create(dto: CreateFlightDto): Promise<Flight> {
    const flight: Flight = {
      ...dto,
      origin: dto.origin.toUpperCase(),
      destination: dto.destination.toUpperCase(),
      currency: dto.currency.toUpperCase(),
    };

    try {
      await this.flightsRepository.create(flight);
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === 'ConditionalCheckFailedException'
      ) {
        throw new ConflictException(
          `Flight with ID ${flight.flightId} already exists`,
        );
      }

      throw error;
    }

    try {
      await this.flightsSearchRepository.indexFlight(flight);
    } catch {
      // The DynamoDB write has succeeded, but the search index has not.
      throw new ServiceUnavailableException(
        `Flight ${flight.flightId} was saved, but search indexing failed. Please retry synchronisation.`,
      );
    }

    return flight;
  }
}
