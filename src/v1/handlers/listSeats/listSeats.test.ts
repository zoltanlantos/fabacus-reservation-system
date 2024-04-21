import { describe, expect, it } from 'bun:test';
import { mockSeat1 } from '@/v1/tests/mocks';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleListSeats } from './listSeats';

const app = new Elysia().use(handleListSeats);
const api = treaty(app);

describe('handle list seats', () => {
  it('should return list of seats', async () => {
    const { data, response, error } = await api.v1.events({ eventId: 'mock-id' }).seats.get();
    expect(response.status).toBe(200);
    expect(data).toStrictEqual([mockSeat1]);
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(error).toBeNull();
  });
});
