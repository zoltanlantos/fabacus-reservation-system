import { nanoIdLength } from '@/config';
import { redisConnect } from '@/v1/helpers/redis';
import { Elysia, t } from 'elysia';

export const handleListSeats = new Elysia().get(
  '/v1/events/:eventId/seats',
  async ({ error, params }) => {
    try {
      const redis = await redisConnect();
      const freeSeats = await redis.sMembers(`event:${params.eventId}:seats:free`);
      const tasks = freeSeats.map((seat) => redis.hGetAll(seat));
      const seatDataList = await Promise.all(tasks);
      redis.quit();

      return seatDataList;
    } catch (e) {
      console.error(e);
      return error(500, { error: 'List Seats error', message: e });
    }
  },
  {
    params: t.Object({
      eventId: t.String({ minLength: nanoIdLength }),
    }),
    detail: {
      description: 'List all free seats for an event.',
      tags: ['events'],
    },
  },
);
