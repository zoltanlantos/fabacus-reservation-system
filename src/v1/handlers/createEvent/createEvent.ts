import { redisConnect } from '@/v1/helpers/redis';
import { Elysia, t } from 'elysia';
import { nanoid } from 'nanoid';

const handlerPath = '/v1/events';

const detail = {
  description: 'Create an event with seats between 10 and 1000 (inclusive)',
  tags: ['events'],
};

const body = t.Object(
  //* note: functional requirements only specify the seats range,
  //* The other meta fields are added for completeness
  {
    name: t.String({ minLength: 3 }),
    description: t.Optional(t.String()),
    date: t.Optional(t.String()),
    location: t.Optional(t.String()),
    seats: t.Number({ minimum: 10, maximum: 1000 }),
  },
  { description: 'An event can be created with these fields passed in the body.' },
);

export const handleCreateEvent = new Elysia().put(
  handlerPath,
  async ({ error, body }) => {
    const eventId = nanoid();

    try {
      const redis = await redisConnect();
      const tr = redis.multi();
      tr.set(`event:${eventId}`, JSON.stringify({ ...body, id: eventId }));

      for (const seatIdx of Array.from({ length: body.seats }).keys()) {
        const seatId = nanoid();
        const seatKey = `seat:${seatId}`;
        tr.sAdd(`event:${eventId}:seats`, seatKey);
        tr.hSet(seatKey, 'id', seatId);
        tr.hSet(seatKey, 'name', `Seat #${seatIdx + 1}`);
        tr.hSet(seatKey, 'status', 'free');
        tr.sAdd(`event:${eventId}:seats:free`, seatKey);
      }
      await tr.exec();
      await redis.quit();

      return { id: eventId };
    } catch (e) {
      console.error(e);
      return error(500, { error: 'Create Event error', message: e });
    }
  },
  { detail, body },
);
