import pkg from '../package.json';

export const appTitle = pkg.name
  .split('-')
  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
  .join(' ');

export const appDescription = pkg.description;

export const appVersion = pkg.version;

export const jwtSecret = process.env.JWT_SECRET;

export const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const seatHoldTime = Number(process.env.SEAT_HOLD_TIME) || 60;

export const seatUserLimit = Number(process.env.SEAT_USER_LIMIT) || 1;

export const nanoIdLength = 21;
