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
 * Design notes: Free seats are indicated by not having an associated status.
 * The status is stored as a string in the format "<status>:<userId>".
 * Seat has tables and status strings are fetched in a single redis.multi() call to reduce requests.
 */

export const handleListSeats = new Elysia()
  //// keep formatting
  .use(userStore())
  .get(
    handlerPath,
    async ({ error, params, store: { user } }) => {
      try {
        // Design note: consider to move user checks to a macro (https://elysiajs.com/patterns/macro.html)
        if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
        if (!['admin', 'patron'].includes(user.role))
          return error(403, { error: 'Forbidden', message: 'Insufficient permissions' });

        const eventKey = `event:${params.eventId}`;

        const redis = await redisConnect();
        const seatKeys = await redis.sMembers(`${eventKey}:seats`);
        const tr = redis.multi();
        for (const seatKey of seatKeys) {
          tr.hGetAll(seatKey);
          tr.get(`${eventKey}:${seatKey}:status`);
        }
        const trData = await tr.exec();
        const freeSeats = [];
        for (let i = 0; i < trData.length; i += 2) {
          const seat = trData[i] as Record<string, string> | undefined;
          if (seat?.id) {
            const status = trData[i + 1] as string | null;
            seat.status = status?.split(':')[0] || 'free';
            if (seat.status === 'free') freeSeats.push(seat);
          }
        }
        return freeSeats;
      } catch (e) {
        console.error(e);
        return error(500, { error: 'List seats error', message: e });
      }
    },
    { detail, params },
  );
