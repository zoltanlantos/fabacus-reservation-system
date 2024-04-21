import { mock } from 'bun:test';

export const mockSeat1 = {
  id: 'mock-seat-id-1',
  name: 'Seat #1',
  status: 'free',
};

mock.module('nanoid', () => ({ nanoid: () => 'mock-id' }));

//* note: if this gets more complex, consider using `redis-mock`
mock.module('@/v1/helpers/redis', () => ({
  redisSet: () => {},
  redisSetAdd: () => {},
  redisSetMembers: () => [mockSeat1],
}));
