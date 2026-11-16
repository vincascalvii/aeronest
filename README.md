# Flights Booking API

A flight-booking API built with [NestJS](https://nestjs.com/), [DynamoDB](https://aws.amazon.com/dynamodb/), and [Elasticsearch](https://www.elastic.co/elasticsearch/).

The project demonstrates a backend architecture using NestJS to coordinate flight data operations, DynamoDB as the primary data store, and Elasticsearch for flexible flight searching.

## Architecture

The application separates responsibilities across controllers, services, and repositories.

- **NestJS** – API framework and application structure.
- **DynamoDB** – Primary data store for flight records.
- **Elasticsearch** – Search engine for filtering and retrieving flights.
- **AWS SDK v3** – Communicates with DynamoDB.
- **Elasticsearch JavaScript Client** – Communicates with Elasticsearch.

### Data flow

- Flight creation: Controller → Service → DynamoDB Repository → DynamoDB → Elasticsearch Repository → Elasticsearch.
- Flight lookup: Controller → Service → DynamoDB Repository → DynamoDB.
- Flight search: Controller → Service → Elasticsearch Repository → Elasticsearch.

DynamoDB is the source of truth for flight records, while Elasticsearch maintains a searchable representation of those records.

## Current API

| Method | Route | Description |
| ------ | ----- | ----------- |
| `POST` | `/flights` | Creates a flight, saves it to DynamoDB, and indexes it in Elasticsearch. Returns `409` if the flight ID already exists. |
| `GET` | `/flights/:id` | Retrieves a flight by its identifier from DynamoDB. Returns `404` when the flight does not exist. |
| `GET` | `/flights/search` | Searches flights using origin, destination, and departure date, with pagination support. |

### Flight data

Flight records contain:

| Field | Description |
| ----- | ----------- |
| `flightId` | Unique flight instance identifier |
| `flightNumber` | Airline flight number |
| `airline` | Airline name |
| `origin` | Three-letter departure airport code |
| `destination` | Three-letter arrival airport code |
| `departureTime` | Scheduled departure time (ISO 8601) |
| `arrivalTime` | Scheduled arrival time (ISO 8601) |
| `price` | Flight price |
| `currency` | Three-letter currency code |

### Search parameters

`GET /flights/search` accepts the following query parameters:

| Parameter | Required | Description | Default |
| --------- | -------- | ----------- | ------- |
| `origin` | Yes | Three-letter departure airport code | — |
| `destination` | Yes | Three-letter arrival airport code | — |
| `departureDate` | Yes | Departure date in `YYYY-MM-DD` format | — |
| `passengers` | No | Number of passengers (1–9) | `1` |
| `page` | No | Page number | `1` |
| `limit` | No | Results per page (1–100) | `10` |

Example:

```bash
curl "http://localhost:3000/flights/search?origin=BNE&destination=SYD&departureDate=2026-12-01&page=1&limit=10"
```

### Create a flight

Example request:

```bash
curl -X POST "http://localhost:3000/flights" \
  -H "Content-Type: application/json" \
  -d '{
    "flightId": "FL004",
    "flightNumber": "QF456",
    "airline": "Qantas",
    "origin": "BNE",
    "destination": "SYD",
    "departureTime": "2026-12-01T12:00:00Z",
    "arrivalTime": "2026-12-01T13:35:00Z",
    "price": 275,
    "currency": "AUD"
  }'
```

## Configuration

The application reads configuration from environment variables.

| Variable | Description | Default |
| -------- | ----------- | ------- |
| `PORT` | HTTP port | `3000` |
| `AWS_REGION` | AWS region for DynamoDB | `ap-southeast-2` |
| `DYNAMODB_ENDPOINT` | Optional DynamoDB-compatible endpoint, typically for local development | — |
| `AWS_ACCESS_KEY_ID` | Access key used with a custom DynamoDB endpoint | `local` |
| `AWS_SECRET_ACCESS_KEY` | Secret key used with a custom DynamoDB endpoint | `local` |
| `DYNAMODB_FLIGHTS_TABLE` | DynamoDB table containing flight records | Required |
| `ELASTICSEARCH_NODE` | Elasticsearch node URL | Required |
| `ELASTICSEARCH_FLIGHTS_INDEX` | Elasticsearch index containing flight documents | `flights` |

When `DYNAMODB_ENDPOINT` is not set, the AWS SDK uses its standard credential provider chain.

### Example `.env`

```env
PORT=3000

AWS_REGION=ap-southeast-2
AWS_ACCESS_KEY_ID=local
AWS_SECRET_ACCESS_KEY=local
DYNAMODB_ENDPOINT=http://localhost:8000
DYNAMODB_FLIGHTS_TABLE=Flights

ELASTICSEARCH_NODE=http://localhost:9200
ELASTICSEARCH_FLIGHTS_INDEX=flights
```

The example AWS credentials are dummy credentials for DynamoDB Local only. Do not use them with real AWS environments.

Keep `.env` out of version control.

## Run locally

### Prerequisites

- Node.js
- npm
- Docker Desktop with WSL 2 integration (if developing on Windows)
- AWS CLI

### 1. Install dependencies

```bash
npm install
```

### 2. Start DynamoDB Local

Run DynamoDB Local using Docker:

```bash
docker run -d \
  --name dynamodb-local \
  -p 8000:8000 \
  amazon/dynamodb-local:latest \
  -jar DynamoDBLocal.jar -sharedDb -inMemory
```

The `-inMemory` option means data is not persisted when the container stops or is recreated.

### 3. Configure AWS CLI for local development

DynamoDB Local still requires the AWS CLI to have credentials configured, even though real AWS credentials are not needed.

```bash
export AWS_ACCESS_KEY_ID=local
export AWS_SECRET_ACCESS_KEY=local
export AWS_DEFAULT_REGION=ap-southeast-2
```

### 4. Create the DynamoDB table

```bash
aws dynamodb create-table \
  --table-name Flights \
  --attribute-definitions AttributeName=flightId,AttributeType=S \
  --key-schema AttributeName=flightId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --endpoint-url http://localhost:8000 \
  --region ap-southeast-2
```

The table uses `flightId` as its partition key.

### 5. Start Elasticsearch

Start Elasticsearch using the project's Docker Compose configuration:

```bash
docker compose up -d
```

Elasticsearch should be accessible at:

```text
http://localhost:9200
```

The application checks whether the configured flights index exists during startup and creates it with the required mappings if it does not.

### 6. Start the API

Once DynamoDB Local and Elasticsearch are running, start NestJS:

```bash
npm run start:dev
```

The API listens on port `3000` by default.

## Elasticsearch

The `flights` index stores searchable flight documents.

The index mapping uses:

- `keyword` fields for exact matching and filtering, such as airport codes, airline names, and flight IDs.
- `date` fields for departure and arrival times.
- `double` fields for flight prices.

Flight searches use Elasticsearch filters to match origin, destination, and departure date. Results are sorted by departure time and support pagination.

## Data consistency

The current flight creation workflow uses a straightforward dual-write approach:

1. Save the flight record to DynamoDB.
2. Index the flight document in Elasticsearch.

DynamoDB is treated as the primary data store. If Elasticsearch indexing fails after a successful DynamoDB write, the two systems can become temporarily inconsistent.

A future improvement is to introduce the **Transactional Outbox Pattern** to make synchronisation more reliable.

## Project structure

```text
src/
├── database/
│   ├── dynamodb.module.ts
│   └── dynamodb.service.ts
├── elasticsearch/
│   ├── elasticsearch.module.ts
│   └── elasticsearch.service.ts
├── flights/
│   ├── dto/
│   │   ├── create-flight.dto.ts
│   │   ├── flight-response.dto.ts
│   │   └── flight-search.dto.ts
│   ├── entities/
│   │   ├── flight.entity.ts
│   │   └── flight-search-result.entity.ts
│   ├── repositories/
│   │   ├── flights.repository.ts
│   │   └── flights-search.repository.ts
│   ├── flights.controller.ts
│   ├── flights.module.ts
│   └── flights.service.ts
├── app.module.ts
└── main.ts
```

## Tests

Run unit tests:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

## Future improvements

- Implement the Transactional Outbox Pattern for reliable DynamoDB and Elasticsearch synchronisation.
- Add flight update and deletion operations.
- Introduce booking and itinerary management.
- Implement authentication and authorisation.
- Improve search capabilities with additional filters and sorting.
- Add integration tests for DynamoDB and Elasticsearch workflows.
- Improve error handling, logging, and operational monitoring.
