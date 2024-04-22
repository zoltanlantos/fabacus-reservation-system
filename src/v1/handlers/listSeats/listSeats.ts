import { nanoIdLength } from '@/config';
import { redisConnect } from '@/v1/helpers/redis';
import { userStore } from '@/v1/plugins/userStore';
import { Elysia, t } from 'elysia';

const handlerPath = '/v1/events/:eventId/seats';

const params = t.Object({
  eventId: t.String({ minLength: nanoIdLength }),
});

const detail = {
  description: 'List all free seats for an event.',
  tags: ['events'],
};

/**
 * List all free seats for an event.
 *
 * @param {Object} params - The event id
 * @param {string} params.eventId - The event id
 * @returns {Object[]} - The list of free seats for the event
 * @returns {string} Object[].id - The seat id
 * @returns {string} Object[].name - The seat name
 * @returns {string} Object[].status - The seat status
 * @throws {401} - Unauthorized - Missing or invalid token
 *
 * Design notes: Using the event:<eventId>:seats:free set enable quick list and holding of seats,
 * it serves as a lookup table (manual index) for the free seats.
 * As the complexity grows it could be replaced with an automated redis index built from the seat:<seatId> hash table.
 */

export const handleListSeats = new Elysia()
  //// keep formatting
  .use(userStore())
  .get(
    handlerPath,
    async ({ error, params, store: { user } }) => {
      try {
        //* note: consider to move user checks to a macro (https://elysiajs.com/patterns/macro.html)
        if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
        if (!['admin', 'patron'].includes(user.role))
          return error(403, { error: 'Forbidden', message: 'Insufficient permissions' });

        const redis = await redisConnect();
        const freeSeats = await redis.sMembers(`event:${params.eventId}:seats:free`);
        const tasks = freeSeats.map((seat) => redis.hGetAll(seat));
        const seatDataList = await Promise.all(tasks);
        redis.quit();

        return seatDataList;
      } catch (e) {
        console.error(e);
        return error(500, { error: 'List seats error', message: e });
      }
    },
    { detail, params },
  );
