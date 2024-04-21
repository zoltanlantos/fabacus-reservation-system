import type Elysia from 'elysia';
import { eventsCreateSchema, handleEventsCreate } from './handlers/eventsCreate';

export const addRouteV1 = (app: Elysia) =>
  app
    //* v1
    .put('/v1/events', handleEventsCreate, eventsCreateSchema)
    //* 404
    .all('/v1/*', ({ error }) => error(404, 'Not Found'));
