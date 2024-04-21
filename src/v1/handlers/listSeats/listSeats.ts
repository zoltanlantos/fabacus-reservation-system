import type { GetHandler } from '@/v1/helpers/misc';
import { redisSetMembers } from '@/v1/helpers/redis';
import { t } from 'elysia';

//* note: functional requirements only specify the seats range, I added the other fields for completeness
export const listSeatsSchema: GetHandler[2] = {
  params: t.Object({
    eventId: t.String({ minLength: 1 }),
  }),
};

export const handleListSeats: GetHandler[1] = async ({ error, params }) => {
  try {
    // todo: filter in redis using @redis/search
    const data = await redisSetMembers(`event:${params.eventId}:seats`);
    return data.filter((seat) => seat.status === 'free');
  } catch (e) {
    console.error(e);
    return error(500, { error: 'Redis set members error', message: e });
  }
};
