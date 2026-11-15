import {
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { FlightsService } from './flights.service.js';
import { FlightResponseDto } from './dto/flight-response.dto.js';
import { Flight } from './entities/flight.entity.js';

/**
 * Handles HTTP requests related to flight resources.
 *
 * Exposes endpoints for retrieving flight information and delegates
 * application logic to the FlightsService.
 */
@ApiTags('Flights')
@Controller('flights')
export class FlightsController {
  constructor(private readonly flightsService: FlightsService) {}

  /**
   * Retrieves a flight by its unique identifier.
   *
   * @param id - The unique identifier of the flight.
   * @returns A promise resolving to the matching flight record.
   * @throws {NotFoundException} If no flight exists with the specified ID.
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Get flight by ID',
    description:
      'Retrieves the details of a flight using its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the flight.',
    example: 'FL001',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Flight successfully retrieved.',
    type: FlightResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No flight was found with the specified ID.',
  })
  async findOne(@Param('id') id: string): Promise<Flight> {
    return this.flightsService.findOne(id);
  }
}
