import { mock } from 'bun:test';
import type { User } from '@/v1/plugins/userStore';

export const mockEventId = 'mock-id-9012345678901';
export const mockSeatIdNone = 'mock-id-none-45678901';
export const mockSeatIdFree = 'mock-id-9012345678901';
export const mockSeatIdHold = 'mock-id-hold-45678901';
export const mockSeatIdHoldOther = 'mock-id-hold-other-01';
export const mockSeatIdReserve = 'mock-id-reserve-78901';

export const mockSeat1 = {
  id: mockSeatIdFree,
  name: 'Seat #1',
  status: 'free',
};

export const mockAdminUser = {
  id: 'mock-admin-id',
  name: 'Mock Admin User',
  role: 'admin' as const,
};

export const mockPatronUser = {
  id: 'mock-patron-id',
  name: 'Mock Patron User',
  role: 'patron' as const,
};

export const mockPatronUserMaxed = {
  id: 'mock-patron-id-maxed',
  name: 'Mock Patron User Maxed',
  role: 'patron' as const,
};

type CTX = { store: { user: User } };

export const setMockAdminUser = (ctx: CTX) => {
  ctx.store.user = mockAdminUser;
};

export const setMockPatronUser = (ctx: CTX) => {
  ctx.store.user = mockPatronUser;
};

export const setMockPatronUserMaxed = (ctx: CTX) => {
  ctx.store.user = mockPatronUserMaxed;
};

//* note: redis-mock doesn't support v4 at the time of writing
const redis = {
  set: () => ({}),
  get: (key: string) => {
    switch (key) {
      case `event:${mockEventId}:seat:${mockSeatIdFree}:hold`:
        return undefined;
      case `event:${mockEventId}:seat:${mockSeatIdFree}:reserve`:
        return undefined;
      case `event:${mockEventId}:seat:${mockSeatIdHold}:hold`:
        return mockPatronUser.id;
      case `event:${mockEventId}:seat:${mockSeatIdHoldOther}:hold`:
        return 'mock-user-other';
      case `event:${mockEventId}:seat:${mockSeatIdReserve}:reserve`:
        return {};
      default:
        return undefined;
    }
  },
  sAdd: () => ({}),
  sRem: () => ({}),
  sMembers: () => ({
    map: () => [mockSeat1],
  }),
  sCard: (key: string) => {
    switch (key) {
      case `user:${mockPatronUserMaxed.id}:seats:held`:
        return 10;
      default:
        return 0;
    }
  },
  hGet: (key: string) => {
    switch (key) {
      case `seat:${mockSeatIdNone}`:
        return undefined;
      case `seat:${mockSeatIdFree}`:
      case `seat:${mockSeatIdHold}`:
      case `seat:${mockSeatIdHoldOther}`:
      case `seat:${mockSeatIdReserve}`:
        return {};
      default:
        return undefined;
    }
  },
  hSet: () => ({}),
  exec: () => [],
};

mock.module('@/v1/helpers/redis', () => ({
  redisConnect: () => ({
    ...redis,
    quit: () => ({}),
    multi: () => redis,
  }),
}));

mock.module('nanoid', () => ({ nanoid: () => 'mock-id' }));
