# Fabacus Reservation System

A service that supports a busy online reservation system using NodeJs, Redis and Docker.

## Installation

To install all dependencies run:

```bash
curl -fsSL https://bun.sh/install | bash
bun install
```

## Development

To start the development server locally run:

```bash
bun dev
```

Open http://localhost:9000/swagger with your browser to see the the API documentation.

To start Redis run:

```bash
docker-compose up redis redis-insight
```

Visit http://localhost:5540/ for Redis Insight

## Production

To start the production version run:

```bash
docker-compose up
```

Open http://localhost:9000/swagger with your browser to see the the API documentation.
Visit http://localhost:5540/ for Redis Insight

# R&D

Taking advantage of the no-time-limit nature of the task, I decided to do a research spike for new technologies and solutions before jumping into implementation.

Instead of starting with a tried and tested framework like Express or Restify, using popular bundlers like Webpack or Rollup, I looked for new boilerplate templates. A template that is set up using a well-rounded bundler like Vite, that supports TypeScript, linting, formatting and testing out of the box. While setting up and configuring an app development environment from scratch was an option, that could be its own project and include a lot of opinionated choices. So instead, I was looking for a neat zero-configuration solution.

## Runtime

I chose Bun, it is a tool that I used to run single .ts files before but not yet used for an entire project. The documentation states:

> Bun is an all-in-one toolkit for JavaScript and TypeScript apps. [...] a fast JavaScript runtime designed as a drop-in replacement for Node.js. It's written in Zig and powered by JavaScriptCore under the hood, dramatically reducing startup times and memory usage.

## Framework

Bun has a large ecosystem that offers alternatives to popular frameworks and libraries often as a drop-in replacement. For this reason, I aimed to explore these alternatives first.

After examining and testing some custom project templates I decided to use ElysiaJs:

> TypeScript framework supercharged by Bun with End-to-End Type Safety, unified type system, and outstanding developer experience.

It comes with a `bun create elysia app` command.

## Linting and Formatting

Bun doesn’t come with a built-in linter or formatter. So, I took this opportunity to explore new alternatives that claim to be compatible but faster than ESLint and Prettier.

One of the popular choices among Bun users is Biome:

> Biome is a fast formatter for JavaScript, TypeScript, JSX, and JSON that scores 97% compatibility with Prettier, saving CI and developer time.

Biome is an opinionated formatter and defaults to tab indentations and double quotes. I changed these to spaces and single quotes and added an `.editorconfig` file.

A considerable disadvantage to using Biome is that it only supports JavaScript, TypeScript, JSX, and JSON files and there are no extensions for other file types like Prettier has.

# TODO

- [x] set up boilerplate
  - [x] bun
  - [x] biome
  - [x] editorconfig
  - [] docker compose
  - [] commitizen
  - [] husky ?
- [] add Redis
- [] add Handlers
  - [] PUT /events
  - [] GET /events/:id/seats
  - [] POST /events/:id/hold
    - [] limit the number of seats a given user can hold in one event.
  - [] POST /events/:id/reserve
  - [] POST /events/:id/hold/refresh ?
- [] require auth header
- [x] handle CORS
- [x] add Swagger
- [] enable TLS
- [] switch both bun and redis containers to alpine
