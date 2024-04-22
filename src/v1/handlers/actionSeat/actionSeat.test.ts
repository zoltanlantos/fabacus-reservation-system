import { describe, expect, it } from 'bun:test';
import {
  mockEventId,
  mockSeatIdFree,
  mockSeatIdHold,
  mockSeatIdHoldOther,
  mockSeatIdNone,
  mockSeatIdReserve,
  setMockAdminUser,
  setMockPatronUser,
} from '@/v1/tests/mocks';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleActionSeat } from './actionSeat';

const apiAdminAuthorized = treaty(new Elysia().use(handleActionSeat).onRequest(setMockAdminUser));
const apiPatronAuthorized = treaty(new Elysia().use(handleActionSeat).onRequest(setMockPatronUser));
const apiUnauthorized = treaty(new Elysia().use(handleActionSeat));

describe('handle seat action', () => {
  it('should return 401', async () => {
    const { data, response, error } = await apiUnauthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdFree })
      .patch({ action: 'hold' });
    expect(response.status).toBe(401);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Unauthorized',
      message: 'Missing or invalid token',
    });
  });

  it('should return 404 Not Found', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdNone })
      .patch({ action: 'hold' });
    expect(response.status).toBe(404);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Not Found',
      message: 'Seat not found',
    });
  });

  it('should return 409 not held', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdFree })
      .patch({ action: 'reserve' });
    expect(response.status).toBe(409);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Conflict',
      message: 'Seat is not held by user',
    });
  });

  it('should return 409 held by other (reserve)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdHoldOther })
      .patch({ action: 'reserve' });
    expect(response.status).toBe(409);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Conflict',
      message: 'Seat is held by another user',
    });
  });

  it('should return 409 held by other (hold)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdHoldOther })
      .patch({ action: 'hold' });
    expect(response.status).toBe(409);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Conflict',
      message: 'Seat is held by another user',
    });
  });

  it('should return 409 already reserved', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdReserve })
      .patch({ action: 'reserve' });
    expect(response.status).toBe(409);
    expect(data).toBeNull();
    expect(error?.value).toEqual({
      error: 'Conflict',
      message: 'Seat is already reserved',
    });
  });

  it('should return 204 (hold)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdFree })
      .patch({ action: 'hold' });
    expect(response.status).toBe(204);
    expect(data).toBeEmpty();
    expect(error).toBeNull();
  });

  it('should return 204 (hold)', async () => {
    const { data, response, error } = await apiAdminAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdFree })
      .patch({ action: 'hold' });
    expect(response.status).toBe(204);
    expect(data).toBeEmpty();
    expect(error).toBeNull();
  });

  it('should return 204 (hold refresh)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdHold })
      .patch({ action: 'hold' });
    expect(response.status).toBe(204);
    expect(data).toBeEmpty();
    expect(error).toBeNull();
  });

  it('should return 204 (reserve)', async () => {
    const { data, response, error } = await apiPatronAuthorized.v1
      .events({ eventId: mockEventId })
      .seats({ seatId: mockSeatIdHold })
      .patch({ action: 'hold' });
    expect(response.status).toBe(204);
    expect(data).toBeEmpty();
    expect(error).toBeNull();
  });
});
