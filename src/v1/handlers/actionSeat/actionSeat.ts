import { nanoIdLength, seatHoldTime } from '@/config';
import { redisConnect } from '@/v1/helpers/redis';
import { userStore } from '@/v1/plugins/userStore';
import { Elysia, t } from 'elysia';

const handlerPath = '/v1/events/:eventId/seats/:seatId';

const detail = {
  description: 'Hold and reserve a seat for an event.',
  tags: ['events'],
};

const params = t.Object({
  eventId: t.String({ minLength: nanoIdLength }),
  seatId: t.String({ minLength: nanoIdLength }),
});

const body = t.Object({
  action: t.String({ enum: ['hold', 'reserved'] }),
});

/**
 * Hold, refresh hold and reserve a seat for an event.
 *
 * @param {Object} params - The event and seat ids
 * @param {string} params.eventId - The event id
 * @param {string} params.seatId - The seat id
 * @param {Object} body - The action to perform
 * @param {string} body.action - The action to perform on the seat
 * @returns {void}
 * @throws {401} - Unauthorized - Missing or invalid token
 * 
 * Design notes: It could be argued that the hold, refresh and reserve actions are different enough to warrant separate endpoints. 
 * I decided to combine them into one as all three operates on the same dataset.
 * A single PATCH endpoint better aligns with semantic REST best practices. 
 */

export const handleActionSeat = new Elysia()
  //// keep formatting
  .use(userStore())
  .patch(
    handlerPath,
    async ({ error, params, body, set, store: { user } }) => {
      try {
        // todo: move user checks to a macro (https://elysiajs.com/patterns/macro.html)
        if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
        if (!['admin', 'patron'].includes(user.role))
          return error(401, { error: 'Unauthorized', message: 'Invalid role' });

        const redis = await redisConnect();
        const eventKey = `event:${params.eventId}`;
        const seatKey = `seat:${params.seatId}`;

        const [holdUser, reserveUser] = await Promise.all([
          redis.get(`${eventKey}:${seatKey}:hold`),
          redis.get(`${eventKey}:${seatKey}:reserved`),
        ]);

        if (reserveUser) return error(409, { error: 'Conflict', message: 'Seat is already reserved' });
        if (holdUser && holdUser !== user.id)
          return error(409, { error: 'Conflict', message: 'Seat is held by another user' });

        const tr = redis.multi();
        // todo: subscribe to hold expiration and readd seat to free
        tr.sRem(`${eventKey}:seats:free`, seatKey);
        tr.hSet(seatKey, 'status', body.action);

        switch (body.action) {
          case 'hold':
            // todo: limit holds per user
            //* note: this sets or resets (refresh) the hold time
            tr.set(`${eventKey}:${seatKey}:hold`, user.id, { EX: seatHoldTime });
            break;
          case 'reserved':
            if (!holdUser) return error(409, { error: 'Conflict', message: 'Seat is not held' });
            tr.del(`${eventKey}:${seatKey}:hold`);
            tr.set(`${eventKey}:${seatKey}:reserved`, user.id);
            break;
        }

        await tr.exec();
        await redis.quit();

        set.status = 204;
        return;
      } catch (e) {
        console.error(e);
        return error(500, { error: 'Redis set error', message: e });
      }
    },
    { detail, params, body },
  );
