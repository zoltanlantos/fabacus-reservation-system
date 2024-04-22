import { nanoIdLength, seatHoldTime } from '@/config';
import { redisConnect } from '@/v1/helpers/redis';
import jwt from '@/v1/plugins/jwt';
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

export const handleActionSeat = new Elysia()
  .use(jwt())
  .derive(async ({ headers, jwt }) => {
    const token = headers.authorization?.replace(/^Bearer /, '');
    return { user: token && (await jwt.verify(token)) };
  })
  .patch(
    handlerPath,
    async ({ error, params, body, set, user }) => {
      try {
        if (!user) return error(401, { error: 'Unauthorized', message: 'Missing or invalid token' });

        const redis = await redisConnect();
        const eventKey = `event:${params.eventId}`;
        const seatKey = `seat:${params.seatId}`;

        // todo: use tr?
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
