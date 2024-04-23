# Fabacus Reservation System

A service that supports a busy online reservation system using NodeJs, Redis and Docker.

## Installation

To install all dependencies run:

```bash
curl -fsSL https://bun.sh/install | bash
bun install
```

To set up env for dev run:

```bash
bun dev:env
```

Then edit `.env` and add a random string for `JWT_SECRET`.

## Development

Please read the [CONTRIBUTING.md](./CONTRIBUTING.md)

To start the development server locally run:

```bash
bun dev
```

Open http://localhost:9000/swagger with your browser to see the the API documentation.

To start Redis run:

```bash
bun start:redis
```

Visit http://localhost:5540/ for Redis Insight

Add Redis Database with Host: `cache` and Port: `6379`

## Production

To start the production version run:

```bash
echo "my super secret password" | docker secret create JWT_SECRET -
docker-compose up
```

The production version of Redis and the API is configured to use the same port numbers as the development instances.

# R&D

Taking advantage of the no-time-limit nature of the task, I decided to do a research spike for new technologies and solutions before jumping into implementation.

Instead of starting with a tried and tested framework like Express or Restify, using popular bundlers like Webpack or Rollup, I looked for new boilerplate templates. A template that is set up using a well-rounded bundler like Vite, that supports TypeScript, linting, formatting and testing out of the box. While setting up and configuring an app development environment from scratch was an option, that could be its own project and include a lot of opinionated choices. So instead, I was looking for a neat zero-configuration solution.

## Runtime

I chose Bun, it is a tool that I used to run single .ts files before but not yet used for an entire project. The documentation states:

> Bun is an all-in-one toolkit for JavaScript and TypeScript apps. [...] a fast JavaScript runtime designed as a drop-in replacement for Node.js. It's written in Zig and powered by JavaScriptCore under the hood, dramatically reducing startup times and memory usage. [...] Bun processes start 4x faster than Node.js.

[Performance chart](https://twitter.com/jarredsumner/status/1499225725492076544)

## Framework

Bun has a large ecosystem that offers alternatives to popular frameworks and libraries often as a drop-in replacement. For this reason, I aimed to explore these alternatives first.

After examining and testing some custom project templates I decided to use ElysiaJs:

> TypeScript framework supercharged by Bun with End-to-End Type Safety, unified type system, and outstanding developer experience.
> Elysia can outperform most of the web frameworks available today, and even match the performance of Golang and Rust framework.

[Performance chart](https://elysiajs.com/at-glance.html#performance)

It comes with a `bun create elysia app` command.

## Linting and Formatting

Bun doesn’t come with a built-in linter or formatter. So, I took this opportunity to explore new alternatives that claim to be compatible but faster than ESLint and Prettier.

One of the popular choices among Bun users is Biome:

> Biome is a fast formatter for JavaScript, TypeScript, JSX, and JSON that scores 97% compatibility with Prettier, saving CI and developer time.

Biome is an opinionated formatter and defaults to tab indentations and double quotes. I changed these to spaces and single quotes and added an `.editorconfig` file.

A considerable disadvantage to using Biome is that it only supports JavaScript, TypeScript, JSX, and JSON files and there are no extensions for other file types like Prettier has.

## System Design

### Architecture Overview

The Fabacus Reservation System is a distributed API built using Node.js, Redis, and Docker. It follows microservices architecture patterns.

The main components of the system are:

- **API Service**: This service handles incoming HTTP requests and serves as the entry point for all API endpoints. It is responsible for authentication, request validation, and routing requests to the appropriate handler. This service manages the creation of events, seat booking, and updating event seat availability.
- **Database**: The system uses Redis to store ephemeral booking operation data points and to also store persistent data, such as event information and booking details. For a real world application an SQL database such as Postgres could be used to store persistent data that in turn can be cached in Redis.

### Communication and Data Flow

The communication between the different components of the system is based on HTTP requests and responses. When a client makes a request to the API service, it validates the request, performs authentication if required, and provides a response.

### Scalability and High Availability

To ensure scalability and high availability, the system can be deployed using Docker containerization technology. The microservice can be deployed with multiple containers behind a reverse proxy to separate the load for admin and patron endpoints, allowing for easy scaling and fault tolerance. Load balancing can be implemented to distribute incoming requests across multiple instances of the API service.

Redis can be configured in a clustered setup to provide high availability and data replication. This ensures that even if one Redis instance fails, the system can continue to function without data loss.

### Security

The system incorporates security measures to protect sensitive data and prevent unauthorized access. Authentication is required for certain API endpoints, and JWT (JSON Web Tokens) are used for token-based authentication. The JWT secret is securely stored and managed using Docker secrets.

To further enhance security, the system can be deployed behind a reverse proxy with TLS (Transport Layer Security) enabled. This ensures that all communication between clients and the API service is encrypted.

### Monitoring and Logging

Monitoring and logging are essential for maintaining the health and performance of the system. The system can be integrated with monitoring tools such as Prometheus and Grafana to collect and visualize metrics. Logging can be implemented using tools like ELK (Elasticsearch, Logstash, and Kibana) stack to store and analyze logs.

By monitoring metrics and analyzing logs, the system administrators can identify performance bottlenecks, troubleshoot issues, and make informed decisions for optimizing the system.

### Conclusion

The Fabacus Reservation System is designed as a distributed API using Node.js, Redis, and Docker. It follows microservices architecture patterns to ensure scalability, high availability, and maintainability. With its modular design and use of caching, the system can handle a busy online reservation system efficiently.

# TODO

- [x] documentation
  - [x] add Swagger
  - [x] add design notes
  - [x] add system design
  - [x] add CONTRIBUTING
  - [x] finalize README
- [x] set up boilerplate
  - [x] bun
  - [x] biome
  - [x] editorconfig
  - [x] docker compose
    - [x] add app service
    - [ ] switch containers to alpine
    - [ ] enable TLS
  - [ ] commitizen
  - [ ] husky
  - [ ] github actions
- [x] add Redis
  - [ ] secure instance
- [x] add Handlers
  - [x] PUT /events
  - [x] GET /events/:eventId/seats
  - [x] PATCH /events/:eventId/seats/:seatId
    - [x] hold
      - [x] expire hold
      - [x] refresh hold
      - [x] limit the number of seats a given user can hold in one event
    - [x] reserve
- [x] require auth header
- [x] handle CORS
- [ ] load testing
- [ ] pen testing

Note: This API implementation is feature complete, the TODO items left unchecked are tasks that would needed to be completed before a production release.
