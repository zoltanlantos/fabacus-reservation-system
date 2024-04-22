import { mock } from 'bun:test';
import type { User } from '@/v1/plugins/userStore';

export const mockEventId = 'mock-id-9012345678901';
export const mockSeatIdNone = 'mock-id-none-45678901';
export const mockSeatIdFree = 'mock-id-free-45678901';
export const mockSeatIdHold = 'mock-id-hold-45678901';
export const mockSeatIdHoldOther = 'mock-id-hold-other-01';
export const mockSeatIdReserve = 'mock-id-reserve-78901';

export const mockSeatDataFree = {
  id: mockSeatIdFree,
  name: 'Seat #free',
  status: 'free',
};

export const mockSeatDataHold = {
  id: mockSeatIdHold,
  name: 'Seat #hold',
  status: 'hold',
};

export const mockSeatDataHoldOther = {
  id: mockSeatIdHoldOther,
  name: 'Seat #hold-other',
  status: 'hold',
};

export const mockSeatDataReserve = {
  id: mockSeatIdReserve,
  name: 'Seat #reserve',
  status: 'reserve',
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
      case `event:${mockEventId}:seat:${mockSeatIdHold}:status`:
        return `hold:${mockPatronUser.id}`;
      case `event:${mockEventId}:seat:${mockSeatIdHoldOther}:status`:
        return `hold:${mockAdminUser.id}`;
      case `event:${mockEventId}:seat:${mockSeatIdReserve}:status`:
        return `reserve:${mockPatronUser.id}`;
      default:
        return undefined;
    }
  },
  sAdd: () => ({}),
  sRem: () => ({}),
  sMembers: (key: string) => {
    switch (key) {
      case `user:${mockPatronUserMaxed.id}:seats:held`:
        return [`event:${mockEventId}:seat:${mockSeatIdHold}`];
      case `event:${mockEventId}:seats`:
        return [`seat:${mockSeatIdFree}`, `seat:${mockSeatIdHold}`, `seat:${mockSeatIdReserve}`];
      default:
        return { map: () => [mockSeatDataFree] };
    }
  },
  sCard: (key: string) => {
    switch (key) {
      case `user:${mockPatronUserMaxed.id}:seats:held`:
        return 10;
      default:
        return 0;
    }
  },
  hExists: (key: string) => {
    switch (key) {
      case `seat:${mockSeatIdFree}`:
      case `seat:${mockSeatIdHold}`:
      case `seat:${mockSeatIdHoldOther}`:
      case `seat:${mockSeatIdReserve}`:
        return true;
      default:
        return false;
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
  hGetAll: (key: string) => {
    switch (key) {
      case `seat:${mockSeatIdFree}`:
        return mockSeatDataFree;
      case `seat:${mockSeatIdHold}`:
        return mockSeatDataHold;
      case `seat:${mockSeatIdHoldOther}`:
        return mockSeatDataHoldOther;
      case `seat:${mockSeatIdReserve}`:
        return mockSeatDataReserve;
      default:
        return undefined;
    }
  },
  hSet: () => ({}),
  exec: () => {
    if (process.env.TESTING_SEAT_LIMIT) return [`hold:${mockPatronUser.id}`];
    return [mockSeatDataFree, null];
  },
};

mock.module('@/v1/helpers/redis', () => ({
  redisConnect: () => ({
    ...redis,
    quit: () => ({}),
    multi: () => redis,
  }),
}));

mock.module('nanoid', () => ({ nanoid: () => 'mock-id' }));
