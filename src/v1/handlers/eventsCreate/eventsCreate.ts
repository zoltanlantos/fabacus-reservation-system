import type Elysia from 'elysia';
import { t } from 'elysia';
import { nanoid } from 'nanoid';
import type { PutHandler } from '@/v1/helpers/misc';
import { redisSet } from '@/v1/helpers/redis';

//* note: functional requirements only specify the seats range, I added the other fields for completeness
export const eventsCreateSchema: PutHandler[2] = {
  body: t.Object({
    name: t.String({ minLength: 3 }),
    description: t.Optional(t.String()),
    date: t.Optional(t.String()),
    location: t.Optional(t.String()),
    seats: t.Number({ minimum: 10, maximum: 1000 }),
  }),
  response: t.Object({
    id: t.String(),
  }),
};

export const handleEventsCreate: PutHandler[1] = async ({ error, body }) => {
  const id = nanoid();

  try {
    await redisSet(`event:${id}`, body);
  } catch (e) {
    return error(500, { error: 'Redis set error', message: e });
  }

  return { id };
};
