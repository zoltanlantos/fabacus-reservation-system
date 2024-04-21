import type { PutHandler } from '@/v1/helpers/misc';
import { redisSet, redisSetAdd } from '@/v1/helpers/redis';
import { t } from 'elysia';
import { nanoid } from 'nanoid';

//* note: functional requirements only specify the seats range, I added the other fields for completeness
export const createEventSchema: PutHandler[2] = {
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

export const handleCreateEvent: PutHandler[1] = async ({ error, body }) => {
  const id = nanoid();

  try {
    await redisSet(`event:${id}`, body);
    const seats = Array.from({ length: body.seats }, (_, i) => ({
      id: nanoid(),
      name: `Seat #${i + 1}`,
      status: 'free',
    }));
    for (const seat of seats) {
      redisSetAdd(`event:${id}:seats`, seat);
    }

    return { id };
  } catch (e) {
    console.error(e);
    return error(500, { error: 'Redis set error', message: e });
  }
};
