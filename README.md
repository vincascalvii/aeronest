# Flights Booking API

A simple Flights Booking API built with [NestJS](https://nestjs.com/), [DynamoDB](https://aws.amazon.com/dynamodb/), and integrated with [Elasticsearch](https://www.elastic.co/elasticsearch/) for flight search.

## Current API

The checked-in API currently exposes the DynamoDB-backed lookup below; Elasticsearch-backed API operations are not present in the current source.

| Method | Route          | Description                                                                                       |
| ------ | -------------- | ------------------------------------------------------------------------------------------------- |
| `GET`  | `/flights/:id` | Retrieves a flight by its identifier from DynamoDB. Returns `404` when the flight does not exist. |

Flight records contain a flight ID and number, airline, origin and destination airport codes, departure and arrival times, price, and currency.

## Configuration

The application reads configuration from environment variables:

| Variable                 | Description                                                            | Default          |
| ------------------------ | ---------------------------------------------------------------------- | ---------------- |
| `PORT`                   | HTTP port                                                              | `3000`           |
| `AWS_REGION`             | AWS region for DynamoDB                                                | `ap-southeast-2` |
| `DYNAMODB_ENDPOINT`      | Optional DynamoDB-compatible endpoint, typically for local development | —                |
| `AWS_ACCESS_KEY_ID`      | Access key used with a custom DynamoDB endpoint                        | `local`          |
| `AWS_SECRET_ACCESS_KEY`  | Secret key used with a custom DynamoDB endpoint                        | `local`          |
| `DYNAMODB_FLIGHTS_TABLE` | DynamoDB table containing flight records                               | Required         |

When `DYNAMODB_ENDPOINT` is not set, the AWS SDK uses its standard credential provider chain.

## Run locally

Install dependencies:

```bash
npm install
```

Set `DYNAMODB_FLIGHTS_TABLE` and any required AWS settings, then start the API:

```bash
npm run start:dev
```

The API listens on port `3000` by default. Override it with `PORT`.

## Tests

```bash
npm test
npm run test:e2e
```
