import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Matches,
  Min,
  IsNotEmpty,
  IsDateString,
} from 'class-validator';

export class CreateFlightDto {
  @ApiProperty({ example: 'FL004' })
  @IsString()
  @IsNotEmpty()
  flightId!: string;

  @ApiProperty({ example: 'QF456' })
  @IsString()
  @IsNotEmpty()
  flightNumber!: string;

  @ApiProperty({ example: 'Qantas' })
  @IsString()
  @IsNotEmpty()
  airline!: string;

  @ApiProperty({ example: 'BNE' })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  origin!: string;

  @ApiProperty({ example: 'SYD' })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  destination!: string;

  @ApiProperty({ example: '2026-12-01T12:00:00Z' })
  @IsDateString()
  departureTime!: string;

  @ApiProperty({ example: '2026-12-01T13:35:00Z' })
  @IsDateString()
  arrivalTime!: string;

  @ApiProperty({ example: 275 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ example: 'AUD' })
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  currency!: string;
}
