import type Elysia from 'elysia';
import { handleActionSeat } from './handlers/actionSeat';
import { handleCreateEvent } from './handlers/createEvent';
import { handleListSeats } from './handlers/listSeats';

export const addRoutesV1 = (app: Elysia) =>
  app
    //* v1
    .use(handleCreateEvent)
    .use(handleListSeats)
    .use(handleActionSeat)
    //* 404
    .all('/v1/*', ({ error }) => error(404, 'Not Found'));
