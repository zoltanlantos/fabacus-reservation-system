import { createClient } from 'redis';

export const redisConnect = async () =>
  await createClient({
    // todo: use env variables
    url: 'redis://localhost:6379',
  }).connect();

// todo: move redis connect to a middleware
export const redisSet = async (key: string, value: Record<string, unknown>) => {
  const redis = await redisConnect();
  await redis.set(key, JSON.stringify(value));
  await redis.quit();
};
