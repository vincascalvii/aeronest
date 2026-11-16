import { Flight } from './flight.entity.js';

/**
 * Represents a paginated flight search result.
 */
export interface FlightSearchResult {
  flights: Flight[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
