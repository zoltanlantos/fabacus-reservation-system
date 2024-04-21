import type { GetHandler } from '@/v1/helpers/misc';
import { redisSetMembers } from '@/v1/helpers/redis';
import { Elysia, t } from 'elysia';

export const handleListSeats = new Elysia().get(
  '/v1/events/:eventId/seats',
  async ({ error, params }) => {
    try {
      // todo: filter in redis using @redis/search
      const data = await redisSetMembers(`event:${params.eventId}:seats`);
      return data.filter((seat) => seat.status === 'free');
    } catch (e) {
      console.error(e);
      return error(500, { error: 'Redis set members error', message: e });
    }
  },
  {
    params: t.Object({
      eventId: t.String({ minLength: 1 }),
    }),
  },
);
