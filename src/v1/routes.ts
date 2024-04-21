import type Elysia from 'elysia';
import { createEventSchema, handleCreateEvent } from './handlers/createEvent';
import { handleListSeats, listSeatsSchema } from './handlers/listSeats';

export const addRoutesV1 = (app: Elysia) =>
  app
    //* v1
    .put('/v1/events', handleCreateEvent, createEventSchema)
    .get('/v1/events/:eventId/seats', handleListSeats, listSeatsSchema)
    //* 404
    .all('/v1/*', ({ error }) => error(404, 'Not Found'));
