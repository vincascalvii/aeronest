import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Defines the query parameters accepted by the flight search endpoint.
 *
 * Validates departure and destination airports, departure date,
 * passenger count and pagination options.
 */
export class FlightSearchDto {
  /** IATA airport code of the departure airport. */
  @ApiProperty({
    description: 'Three-letter IATA departure airport code.',
    example: 'BNE',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'origin must be a valid three-letter uppercase airport code',
  })
  origin!: string;

  /** IATA airport code of the destination airport. */
  @ApiProperty({
    description: 'Three-letter IATA destination airport code.',
    example: 'SYD',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsString()
  @Matches(/^[A-Z]{3}$/, {
    message: 'destination must be a valid three-letter uppercase airport code',
  })
  destination!: string;

  /** Requested departure date in YYYY-MM-DD format. */
  @ApiProperty({
    description: 'Departure date in ISO 8601 date format.',
    example: '2026-12-01',
  })
  @IsDateString()
  departureDate!: string;

  /** Number of passengers travelling. Defaults to one. */
  @ApiPropertyOptional({
    description: 'Number of passengers.',
    example: 1,
    default: 1,
    minimum: 1,
    maximum: 9,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9)
  passengers: number = 1;

  /** Requested result page. Defaults to the first page. */
  @ApiPropertyOptional({
    description: 'Page number of the search results.',
    example: 1,
    default: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  /** Maximum number of results per page. Defaults to ten. */
  @ApiPropertyOptional({
    description: 'Maximum number of results returned per page.',
    example: 10,
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}
