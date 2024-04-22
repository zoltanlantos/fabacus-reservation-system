import { describe, expect, it } from 'bun:test';
import { mockEventId, mockSeatDataFree, setMockAdminUser, setMockPatronUser } from '@/v1/tests/mocks';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleListSeats } from './listSeats';

const apiAdminAuthorized = treaty(new Elysia().use(handleListSeats).onRequest(setMockAdminUser));
const apiPatronAuthorized = treaty(new Elysia().use(handleListSeats).onRequest(setMockPatronUser));
const apiUnauthorized = treaty(new Elysia().use(handleListSeats));

describe('handle list seats', () => {
  it('should return 401 Unauthorized', async () => {
    const { data, response, error } = await apiUnauthorized.v1.events({ eventId: mockEventId }).seats.get();
    expect(response.status).toBe(401);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Unauthorized',
      message: 'Missing or invalid token',
    });
  });

  it('should return list of seats (admin)', async () => {
    const { data, response, error } = await apiAdminAuthorized.v1.events({ eventId: mockEventId }).seats.get();
    expect(response.status).toBe(200);
    expect(data).toStrictEqual([mockSeatDataFree]);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(error).toBeNull();
  });

  it('should return list of seats (patron)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1.events({ eventId: mockEventId }).seats.get();
    expect(response.status).toBe(200);
    expect(data).toStrictEqual([mockSeatDataFree]);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(error).toBeNull();
  });
});
