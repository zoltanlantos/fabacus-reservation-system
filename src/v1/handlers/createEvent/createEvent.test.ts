import { describe, expect, it, spyOn } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleCreateEvent } from './createEvent';

const app = new Elysia().use(handleCreateEvent);
const api = treaty(app);

describe('handle create event', () => {
  it('should create an event', async () => {
    // todo: mock and spyOn redisSet
    const { data, response, error } = await api.v1.events.put({ name: 'event-name', seats: 10 });
    expect(response.status).toBe(200);
    expect(data).toStrictEqual({ id: 'mock-id' });
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(error).toBeNull();
  });

  it('should return error on invalid payload', async () => {
    const { data, response, error } = await api.v1.events.put({ name: 'no', seats: 1 });
    expect(response.status).toBe(422);
    expect(data).toBeNull();
    expect(error).toMatchSnapshot();
  });
});
