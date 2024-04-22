import { redisConnect } from '@/v1/helpers/redis';
import { userStore } from '@/v1/plugins/userStore';
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

/**
 * Events are stored in Redis with the following structure:
 * - event:<eventId> -> { id: <eventId>, name: <name>, description: <description>, date: <date>, location: <location> }
 * - event:<eventId>:seats -> Set of seat keys
 * - seat:<seatId> -> { id: <seatId>, name: <name>, status: 'free' }
 * - event:<eventId>:seats:free -> Set of free seat keys
 *
 * @param {Object} body - The event data to be stored in Redis
 * @param {string} body.name - The name of the event
 * @param {string} [body.description] - The description of the event
 * @param {string} [body.date] - The date of the event
 * @param {string} [body.location] - The location of the event
 * @param {number} body.seats - The number of seats for the event
 * @returns {Object} - The event id
 * @returns {string} Object.id - The event id
 * @throws {401} - Unauthorized - Missing or invalid token
 */

export const handleCreateEvent = new Elysia()
  //// keep formatting
  // todo: this is an admin endpoint, should be restricted to admin users
  .use(userStore())
  .put(
    handlerPath,
    async ({ error, body, store: { user } }) => {
      // todo: move user checks to a macro (https://elysiajs.com/patterns/macro.html)
      if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
      if (!['admin'].includes(user.role)) return error(401, { error: 'Unauthorized', message: 'Invalid role' });

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
