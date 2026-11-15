/**
 * Represents a scheduled flight instance within the booking system.
 *
 * Contains flight identification, airline information, route details,
 * scheduled departure and arrival times, and pricing information.
 */
export interface Flight {
  /** Unique identifier for this specific flight instance. */
  flightId: string;

  /** Airline-specific flight number, such as QF001. */
  flightNumber: string;

  /** Name of the airline operating the flight. */
  airline: string;

  /** IATA airport code of the departure airport. */
  origin: string;

  /** IATA airport code of the destination airport. */
  destination: string;

  /** Scheduled departure time in ISO 8601 format. */
  departureTime: string;

  /** Scheduled arrival time in ISO 8601 format. */
  arrivalTime: string;

  /** Ticket price for the flight. */
  price: number;

  /** Three-letter ISO 4217 currency code. */
  currency: string;
}
