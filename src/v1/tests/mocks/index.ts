import { mock } from 'bun:test';

mock.module('nanoid', () => ({ nanoid: () => 'mock-id' }));

//* note: if this gets more complex, consider using `redis-mock`
mock.module('@/v1/helpers/redis', () => ({
  redisSet: () => {},
}));
