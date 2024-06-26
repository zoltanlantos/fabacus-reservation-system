import { nanoIdLength, seatHoldTime, seatUserLimit } from '@/config';
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
  action: t.String({ enum: ['hold', 'reserve'] }),
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
        // Design note: consider to move user checks to a macro (https://elysiajs.com/patterns/macro.html)
        if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });
        if (!['admin', 'patron'].includes(user.role))
          return error(403, { error: 'Forbidden', message: 'Insufficient permissions' });

        const redis = await redisConnect();
        const eventKey = `event:${params.eventId}`;
        const seatKey = `seat:${params.seatId}`;
        const userKey = `user:${user.id}`;

        const hasSeat = await redis.hExists(seatKey, 'id');
        if (!hasSeat) return error(404, { error: 'Not Found', message: 'Seat not found' });

        // Design note: there is an edge case where the user :seats:held set could be out of sync with the actual held seats
        // This could happen if the user holds a seat, but the hold key is expired before the user reserved the seat.
        // This can accumulate stale items in the :seats:held set. The below code checks if a lock still exists for the held seat.
        // The :seats:held set has auto expiration to clear out stale items.
        const userHeldSeats = await redis.sMembers(`${userKey}:seats:held`);
        if (userHeldSeats.length >= seatUserLimit) {
          const trStatus = redis.multi();
          for (const userHeldSeat of userHeldSeats) {
            trStatus.get(`${userHeldSeat}:status`);
          }
          const trStatusData = await trStatus.exec();
          const stillHeld = trStatusData.filter((status) => (status as string | null)?.startsWith('hold:'));

          if (stillHeld.length >= seatUserLimit) {
            return error(403, { error: 'Forbidden', message: 'Maximum held seats reached' });
          }
        }

        // Design note: in a busy system code execution can get past the checks,
        // but the seat could be held by another user already before the set operation.
        // To handle this, a simple lock is set on the seat key to prevent concurrent operations.
        // The lock has a short expiration to handle edge cases where the lock is not released.
        // The lock is released when the operation is done.
        // A better approach would be to use a distributed lock manager like Redlock.
        const lockKey = `${eventKey}:${seatKey}:lock`;
        const lock = await redis.set(lockKey, 'locked', { EX: 10, NX: true });
        if (!lock) {
          return error(409, { error: 'Conflict', message: 'Seat is already being processed' });
        }

        try {
          const seatStatus = await redis.get(`${eventKey}:${seatKey}:status`);
          const [status, ownerId] = seatStatus?.split(':') || ['free', null];

          if (status === 'reserve') {
            return error(409, { error: 'Conflict', message: 'Seat is already reserved' });
          }
          if (status === 'hold' && ownerId !== user.id) {
            return error(409, { error: 'Conflict', message: 'Seat is held by another user' });
          }
          if (status !== 'hold' && body.action === 'reserve') {
            return error(409, { error: 'Conflict', message: 'Seat is not held by user' });
          }

          const tr = redis.multi();
          switch (body.action) {
            case 'hold':
              // Design note: this handles both setting and refreshing the hold
              tr.set(`${eventKey}:${seatKey}:status`, `hold:${user.id}`, { EX: seatHoldTime });
              tr.sAdd(`${userKey}:seats:held`, `${eventKey}:${seatKey}`);
              // Design note: the :seats:held set has a longer expiration than the :status key to handle stale holds
              tr.expire(`${userKey}:seats:held`, seatHoldTime * 2);
              break;
            case 'reserve':
              tr.set(`${eventKey}:${seatKey}:status`, `reserve:${user.id}`);
              tr.sRem(`${userKey}:seats:held`, `${eventKey}:${seatKey}`);
              break;
          }
          await tr.exec();
          set.status = 204;
          return null;
        } finally {
          await redis.del(lockKey);
          await redis.quit();
        }
      } catch (e) {
        console.error(e);
        return error(500, { error: 'Redis set error', message: e });
      }
    },
    { detail, params, body },
  );
