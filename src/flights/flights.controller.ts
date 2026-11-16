import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FlightsService } from './flights.service.js';
import { FlightResponseDto } from './dto/flight-response.dto.js';
import { FlightSearchDto } from './dto/flight-search.dto.js';
import { FlightSearchResult } from './entities/flight-search-result.entity.js';
import { Flight } from './entities/flight.entity.js';
import { CreateFlightDto } from './dto/create-flight.dto.js';

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
   * Searches for flights based on the provided filters.
   *
   * @param filters - The search criteria including origin, destination, departure date, and optional pagination parameters.
   * @returns A promise resolving to the search results, including matching flights and pagination details.
   */
  @Get('search')
  @ApiOperation({
    summary: 'Search flights',
    description: 'Searches flights by route and departure date.',
  })
  @ApiQuery({ name: 'origin', example: 'BNE', required: true })
  @ApiQuery({ name: 'destination', example: 'SYD', required: true })
  @ApiQuery({
    name: 'departureDate',
    example: '2026-12-01',
    required: true,
  })
  @ApiQuery({ name: 'passengers', example: 1, required: false })
  @ApiQuery({ name: 'page', example: 1, required: false })
  @ApiQuery({ name: 'limit', example: 10, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Matching flights successfully retrieved.',
  })
  async search(@Query() filters: FlightSearchDto): Promise<FlightSearchResult> {
    return this.flightsService.search(filters);
  }

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

  /**
   * Creates a new flight record and indexes it for search.
   *
   * @param dto - The flight data to create.
   * @returns A promise resolving to the created flight record.
   * @throws {ConflictException} If a flight with the same ID already exists.
   */
  @Post()
  @ApiOperation({
    summary: 'Create a flight',
    description: 'Creates a flight and indexes it for search.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Flight successfully created.',
    type: FlightResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'A flight with this ID already exists.',
  })
  async create(@Body() dto: CreateFlightDto): Promise<Flight> {
    return this.flightsService.create(dto);
  }
}
