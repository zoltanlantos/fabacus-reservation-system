import type Elysia from 'elysia';
import { createEventSchema, handleCreateEvent } from './handlers/createEvent';

export const addRoutesV1 = (app: Elysia) =>
  app
    //* v1
    .put('/v1/events', handleCreateEvent, createEventSchema)
    //* 404
    .all('/v1/*', ({ error }) => error(404, 'Not Found'));
