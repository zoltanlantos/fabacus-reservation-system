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
  // Design note: functional requirements only specify the seats range,
  // added the other meta fields for completeness.
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
 * - seat:<seatId> -> { id: <seatId>, name: <name> }
 *
 * @param {Object} body - The event payload to be stored in Redis
 * @param {string} body.name - The name of the event
 * @param {string} [body.description] - The description of the event
 * @param {string} [body.date] - The date of the event
 * @param {string} [body.location] - The location of the event
 * @param {number} body.seats - The number of seats for the event
 * @returns {Object} - The event data
 * @returns {string} Object.id - The event id
 * @throws {401} - Unauthorized - Missing or invalid token
 *
 * Design notes: Event creations also pre-populates the seats for the event.
 * This enables listing and booking based on the created seatId properties.
 * The event is stored in stringified JSON format as functional requirements doesn't specify data requirements.
 * The seats are stored in a hash table to enable quick and easy status updates.
 * The free seats are also stored in a lookup table set. While this is redundant to the status property,
 * it enables quick listing and booking of free seats.
 * In order to reduce redis requests redis.multi() is used to batch the creation of the event and its seats.
 * Used nanoid for unique id generation as it is shorter and simpler than UUID with a similar collision probability,
 * note: nanoid generation is slower but not significant enough for the number of ids generated during this request.
 */

export const handleCreateEvent = new Elysia()
  //// keep formatting
  .use(userStore())
  .put(
    handlerPath,
    async ({ error, body, store: { user } }) => {
      // Design note: consider to move user checks to a macro (https://elysiajs.com/patterns/macro.html)
      if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
      if (!['admin'].includes(user.role))
        return error(403, { error: 'Forbidden', message: 'Insufficient permissions' });

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
