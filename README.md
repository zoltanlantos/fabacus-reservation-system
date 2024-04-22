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

# TODO

- [ ] documentation
  - [x] add Swagger
  - [x] add design notes
  - [ ] add system design
  - [x] add CONTRIBUTING
  - [ ] finalize README
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
