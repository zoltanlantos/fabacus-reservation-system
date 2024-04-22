import { describe, expect, it, spyOn } from 'bun:test';
import { treaty } from '@elysiajs/eden';
import { Elysia } from 'elysia';
import { handleActionSeat } from './actionSeat';

const app = new Elysia().use(handleActionSeat);
const api = treaty(app);

describe('handle create event', () => {
  // todo: assert seat actions
});
