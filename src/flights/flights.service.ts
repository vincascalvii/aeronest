import { Injectable, NotFoundException } from '@nestjs/common';

import { FlightsRepository } from './repositories/flights.repository.js';
import { Flight } from './entities/flight.entity.js';

/**
 * Provides business logic for flight-related operations.
 *
 * Coordinates flight retrieval and delegates data access
 * to the FlightsRepository.
 */
@Injectable()
export class FlightsService {
  constructor(private readonly flightsRepository: FlightsRepository) {}

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
}
