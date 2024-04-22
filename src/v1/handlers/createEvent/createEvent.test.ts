import { describe, expect, it } from 'bun:test';
import { setMockAdminUser, setMockPatronUser } from '@/v1/tests/mocks';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleCreateEvent } from './createEvent';

const apiAdminAuthorized = treaty(new Elysia().use(handleCreateEvent).onRequest(setMockAdminUser));
const apiPatronAuthorized = treaty(new Elysia().use(handleCreateEvent).onRequest(setMockPatronUser));
const apiUnauthorized = treaty(new Elysia().use(handleCreateEvent));

describe('handle create event', () => {
  it('should return 401 Unauthorized', async () => {
    const { data, response, error } = await apiUnauthorized.v1.events.put({ name: 'event-name', seats: 10 });
    expect(response.status).toBe(401);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Unauthorized',
      message: 'Missing or invalid token',
    });
  });

  it('should return 403 Forbidden', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1.events.put({ name: 'event-name', seats: 10 });
    expect(response.status).toBe(403);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Forbidden',
      message: 'Insufficient permissions',
    });
  });

  it('should create an event', async () => {
    // todo: mock and spyOn redisConnect
    const { data, response, error } = await apiAdminAuthorized.v1.events.put({ name: 'event-name', seats: 10 });
    expect(response.status).toBe(200);
    expect(data).toStrictEqual({ id: 'mock-id' });
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(error).toBeNull();
  });

  it('should return error on invalid payload', async () => {
    const { data, response, error } = await apiAdminAuthorized.v1.events.put({ name: 'no', seats: 1 });
    expect(response.status).toBe(422);
    expect(data).toBeNull();
    expect(error).toMatchSnapshot();
  });
});
