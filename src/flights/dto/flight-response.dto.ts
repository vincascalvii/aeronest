import { ApiProperty } from '@nestjs/swagger';

/**
 * Defines the structure of a flight response returned by the API.
 *
 * Provides Swagger metadata for each property so that the flight
 * response schema can be documented in the API specification.
 */
export class FlightResponseDto {
  /** Unique identifier of the scheduled flight instance. */
  @ApiProperty({
    description: 'Unique identifier of the flight.',
    example: 'FL001',
  })
  flightId!: string;

  /** Airline-specific flight number. */
  @ApiProperty({
    description: 'Flight number assigned by the airline.',
    example: 'QF001',
  })
  flightNumber!: string;

  /** Name of the airline operating the flight. */
  @ApiProperty({
    description: 'Name of the operating airline.',
    example: 'Qantas',
  })
  airline!: string;

  /** IATA airport code for the departure airport. */
  @ApiProperty({
    description: 'IATA code of the departure airport.',
    example: 'BNE',
  })
  origin!: string;

  /** IATA airport code for the arrival airport. */
  @ApiProperty({
    description: 'IATA code of the destination airport.',
    example: 'SYD',
  })
  destination!: string;

  /** Scheduled departure time in ISO 8601 format. */
  @ApiProperty({
    description: 'Scheduled departure time in ISO 8601 format.',
    example: '2026-12-01T08:00:00Z',
  })
  departureTime!: string;

  /** Scheduled arrival time in ISO 8601 format. */
  @ApiProperty({
    description: 'Scheduled arrival time in ISO 8601 format.',
    example: '2026-12-01T09:35:00Z',
  })
  arrivalTime!: string;

  /** Ticket price for the flight. */
  @ApiProperty({
    description: 'Flight price.',
    example: 250,
  })
  price!: number;

  /** ISO 4217 currency code for the ticket price. */
  @ApiProperty({
    description: 'Three-letter currency code.',
    example: 'AUD',
  })
  currency!: string;
}
